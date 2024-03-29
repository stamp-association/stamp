import { of, fromPromise, all } from "../adts/async.js";

import {
  map,
  includes,
  assoc,
  filter,
  groupBy,
  prop,
  uniqBy,
  uniq,
  compose,
  find,
  propEq,
  concat,
  keys,
  reduce
} from "ramda";

export function counts(env, txIDs) {
  const query = fromPromise(env.query);
  const services = fromPromise(env.vouchServices);
  const bundlr = fromPromise(env.bundlr);

  return of(txIDs)
    .chain(txs => all([
      query({ query: buildQuery(), variables: { txs } }),
      bundlr({ query: bundlrQuery(), variables: { txs } })
    ]))

    .map(([arweave, bundlr]) => concat(arweave, bundlr))
    .map(uniqBy(prop('id')))
    .map(map(transform))
    .map(uniqBy((o) => `${o.source}:${o.owner}`))
    .chain((stamps) =>
      services()
        .chain((vouchServices) =>
          query({
            query: vouchQuery(),
            variables: {
              services: vouchServices,
              stampers: uniq(stamps.map((s) => s.owner)),
            },
          })
        )
        .map(transformVouched)

        .map((vouched) =>
          map(
            (s) => (includes(s.owner, vouched) ? assoc("vouched", true, s) : s),
            stamps
          )
        )
    )
    .map(groupBy(prop("source")))
    .map(
      map((stamps) => ({
        total: stamps.length,
        vouched: filter(propEq(true, "vouched"), stamps).length,
      }))
    )
    .map(result => {
      if (keys(result).length === 0) {
        return reduce(
          (a, tx) => {
            a[tx] = { total: 0, vouched: 0 }
            return a
          }
          , {}, txIDs
        )
      }
      return result
    });
}

function transformVouched(nodes) {
  return compose(
    uniq,
    map((r) =>
      compose(prop("value"), find(propEq("Vouch-For", "name")))(r.tags)
    )
  )(nodes);
}

function transform(node) {
  const tags = node.tags.reduce(
    (acc, { name, value }) => assoc(name, value, acc),
    {}
  );
  return {
    owner: tags["Sequencer-Owner"] || node?.address || node?.owner?.address,
    height: tags["Sequencer-Block-Height"],
    source: tags["Data-Source"],
  };
}

function bundlrQuery() {
  return `query ($cursor: String, $txs: [String!]!) {
    transactions(
      tags:[
        {name: "Protocol-Name", values: ["Stamp"]},
        {name: "Data-Source", values: $txs}
      ]
      limit: 100
      after: $cursor
    ) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          address
          tags {
            name
            value
          }
        }
      }
    }
  }`;
}

function buildQuery() {
  return `query ($cursor: String, $txs: [String!]!) {
    transactions(
      tags:[
        {name: "Protocol-Name", values: ["Stamp"]},
        {name: "Data-Source", values: $txs}
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
          owner { address }
          tags {
            name
            value
          }
        }
      }
    }
  }`;
}

function vouchQuery() {
  return `query ($cursor: String, $services: [String!]!, $stampers: [String!]!) {
    transactions(
      owners: $services
      tags:{name: "Vouch-For", values: $stampers}
      after: $cursor
      first: 100
    ) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          tags {
            name
            value
          }
        }
      }
    }
  }`;
}
