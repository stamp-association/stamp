import { of, fromPromise, Rejected, Resolved } from "../adts/async.js";
import { or, has } from "ramda";

export function stamp(env, tx, qty = 0, tags = {}) {
  const writeInteraction = fromPromise(env.writeInteraction);
  const getState = fromPromise(env.getState);
  const dispatch = fromPromise(env.dispatch);
  const query = fromPromise(env.query);
  const services = fromPromise(env.vouchServices);
  const getAddress = fromPromise(env.getAddress);

  return of({ tx, qty, tags })
    .map(formatTags)
    .chain((ctx) =>
      getState(tx)
        .chain(isAtomicAsset(ctx))
        // is vouched
        .chain(getCaller(getAddress))
        .chain((ctx) =>
          services()
            .chain((vs) =>
              query({
                query: vouchQuery(),
                variables: {
                  services: vs,
                  stampers: [ctx.caller],
                },
              })
            )
            .chain((vouched) =>
              vouched.length > 0 ? Resolved(ctx) : Rejected(ctx)
            )
            .chain(doWrite(writeInteraction))
            .bichain(_ => Rejected(ctx), Resolved)
        )
    )
    .bichain(doDispatch(dispatch), (x) => Resolved(x));
}

function getCaller(getAddress) {
  return (ctx) => {
    return getAddress().map((addr) => ({ ...ctx, caller: addr }));
  };
}

function doWrite(writeInteraction) {
  return (ctx) =>
    writeInteraction(
      {
        function: "stamp",
        qty: ctx.qty,
      },
      [
        { name: "Data-Source", value: ctx.tx },
        { name: "Protocol-Name", value: "Stamp" },
        { name: "Render-With", value: "card_stamps"},
        ...ctx.tags,
      ]
    );
}

function doDispatch(dispatch) {
  return (ctx) => {
    return dispatch(ctx.tx, [
      { name: "Data-Source", value: ctx.tx },
      { name: "Protocol-Name", value: "Stamp" },
      { name: "Render-With", value: "card_stamps"},
      //...ctx.tags,
    ]);
  };
}

function isAtomicAsset(ctx) {
  return (state) =>
    or(has("balances", state), has("owner", state))
      ? Resolved(ctx)
      : Rejected(ctx);
}

function formatTags(ctx) {
  const tags = Object.keys(ctx.tags).map((k) => ({
    name: k,
    value: ctx.tags[k],
  }));

  return { ...ctx, tags };
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
