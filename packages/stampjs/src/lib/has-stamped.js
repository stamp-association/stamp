import { of, fromPromise, all } from "../adts/async.js";

export function hasStamped(env, tx) {
  const query = fromPromise(env.query);
  const getAddress = fromPromise(env.getAddress);
  return of(tx)
    .chain((tx) => getAddress().map((address) => ({ tx, address })))
    .chain((ctx) => all([query(buildQuery(ctx)), query(buildQuery2(ctx))]))
    .map(([a, b]) => a.concat(b))
    .map((items) => items.length > 0);
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
        }
      }
    }
  }`;

  const variables = {
    txs: [tx],
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
        }
      }
    }
  }`;

  const variables = {
    txs: [tx],
    owners: [address],
  };

  return { query, variables };
}
