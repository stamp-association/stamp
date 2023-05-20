import { of, Rejected, Resolved, fromPromise } from "../lib/async.js";
import { findIndex, propEq, reject } from "ramda";

export function claim(state, action) {
  return of({ state, action })
    .chain(validate)
    .map(({ state, action, idx }) => {
      if (!state.balances[action.caller]) {
        state.balances[action.caller] = 0;
      }
      state.balances[action.caller] += action.input.qty;
      state.claimable.splice(idx, 1);
      return { state };
    });
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
