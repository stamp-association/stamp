import Async from "hyper-async";
import { or, has, always } from "ramda";

const { of, fromPromise, Rejected, Resolved } = Async;

/*
 * check and see if tx is atomic asset
 * and user is vouched
 * if is then stamp with interaction
 * else stamp as a bundle transaction
 */
export function stamp(env, tx, qty = 0, tags = {}) {
  const writeInteraction = fromPromise(env.writeInteraction);
  const getState = fromPromise(env.getState);
  const dispatch = fromPromise(env.dispatch);

  return of({ tx, qty, tags })
    .map(formatTags)
    .chain((ctx) =>
      getState(tx).chain(isAtomicAsset(ctx)).chain(doWrite(writeInteraction))
    )
    .bichain(doDispatch(dispatch), (x) => Resolved(x));
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
        ...ctx.tags,
      ]
    );
}

function doDispatch(dispatch) {
  return (ctx) => dispatch(ctx.tx, ctx.tags);
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
