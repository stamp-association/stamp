import { of, fromPromise, all } from "../adts/async.js";
import { map, uniq, reduce, assoc, keys } from 'ramda'

export function hasStamped(env, tx) {
  const query = fromPromise(env.query);
  const getAddress = fromPromise(env.getAddress);
  tx = typeof tx === "string" ? [tx] : tx
  return of(tx)
    .chain((tx) => getAddress().map((address) => ({ tx, address })))
    .chain((ctx) => all([query(buildQuery(ctx)), query(buildQuery2(ctx))]))
    .map(([a, b]) => a.concat(b))
    .map(map(o => o.tags.find(x => x.name === 'Data-Source').value))
    .map(uniq)
    .map(matches => reduce((acc, id) => matches.find(m => m === id) ? assoc(id, true, acc) : assoc(id, false, acc), {}, tx))
    .map((items) => {
      if (keys(items).length === 0) {
        return false
      } else if (keys(items).length === 1) {
        return items[keys(items)[0]]
      } else {
        return items
      }
    });
}

function buildQuery({ tx, address }) {
  const query = `query($cursor: String, $txs: [String!]!, $owners: [String!]!) {
    transactions(
      tags: [
        { name: "Data-Source", values: $txs},
        { name: "Protocol-Name", values: ["Stamp"]},
        { name: "Sequencer-Owner", values: $owners}
      ]
      after: $cursor
      first: 100
    ) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          tags {
            name
            value
          }
        }
      }
    }
  }`;

  const variables = {
    txs: typeof tx === "string" ? [tx] : tx,
    owners: [address],
  };

  return { query, variables };
}

function buildQuery2({ tx, address }) {
  const query = `query($cursor: String, $txs: [String!]!, $owners: [String!]!) {
    transactions(
      owners: $owners
      tags: [
        { name: "Data-Source", values: $txs},
        { name: "Protocol-Name", values: ["Stamp"]}
      ]
      after: $cursor
      first: 100
    ) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          tags {
            name
            value
          }
        }
      }
    }
  }`;

  const variables = {
    txs: typeof tx === "string" ? [tx] : tx,
    owners: [address],
  };

  return { query, variables };
}
