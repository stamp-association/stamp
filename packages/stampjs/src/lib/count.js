import { of, fromPromise } from "../adts/async.js";
import {
  compose,
  map,
  assoc,
  uniq,
  filter,
  includes,
  prop,
  propEq,
  find,
  uniqBy,
} from "ramda";

export function count(env, tx) {
  const query = fromPromise(env.query);
  const services = fromPromise(env.vouchServices);

  return of(tx)
    .map((tx) => ({ query: buildQuery(), variables: { txs: [tx] } }))
    .chain(query)
    .map(map(transform))
    .map(uniqBy(prop("owner")))
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
    .map((stamps) => ({
      total: stamps.length,
      vouched: filter(propEq(true, "vouched"), stamps).length,
    }));
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
    owner: tags["Sequencer-Owner"] || node.owner.address,
    height: tags["Sequencer-Block-Height"],
    source: tags["Data-Source"],
  };
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
