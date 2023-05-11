import { of, Rejected, Resolved, fromPromise } from "../lib/async.js";
import { findIndex, propEq, reject } from "ramda";

export function claim(env) {
  const get = fromPromise(env.get);
  const put = fromPromise(env.put);
  return (state, action) => {
    return of({ state, action }).chain(validate).chain(processClaim(get, put));
  };
}

function validate({ state, action }) {
  if (!action.input.txID) {
    return Rejected("txID is not found.");
  }

  if (!action.input.qty) {
    return Rejected("claim quantity is not specified.");
  }

  const idx = findIndex(propEq(action.input.txID, "txID"), state.claimable);

  if (idx < 0) {
    return Rejected("claimable not found.");
  }

  if (state.claimable[idx].qty !== action.input.qty) {
    return Rejected("claimable qty is not equal to claim qty.");
  }

  if (state.claimable[idx].to !== action.caller) {
    return Rejected("claim is not addressed to caller.");
  }

  return Resolved({ state, action, idx });
}

function processClaim(get, put) {
  return ({ state, action, idx }) => {
    return get(action.caller)
      .chain((balance = 0) =>
        put(action.caller, balance + state.claimable[idx].qty)
      )
      .map((_) => {
        state.claimable = reject(
          propEq(action.input.txID, "txID"),
          state.claimable
        );
        return { state };
      });
  };
}
