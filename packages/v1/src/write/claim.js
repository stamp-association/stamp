import { of, Left, Right } from "../lib/either.js";
import { findIndex, propEq, reject } from "ramda";

export function claim(state, action) {
  return of({ state, action }).chain(validate).map(processClaim);
}

function validate({ state, action }) {
  if (!action.input.txID) {
    return Left("txID is not found.");
  }

  if (!action.input.qty) {
    return Left("claim quantity is not specified.");
  }

  const idx = findIndex(propEq(action.input.txID, "txID"), state.claimable);

  if (idx < 0) {
    return Left("claimable not found.");
  }

  if (state.claimable[idx].qty !== action.input.qty) {
    return Left("claimable qty is not equal to claim qty.");
  }
  console.log(state.claimable[idx]);
  console.log(action.caller);
  if (state.claimable[idx].to !== action.caller) {
    return Left("claim is not addressed to caller.");
  }

  return Right({ state, action, idx });
}

function processClaim({ state, action, idx }) {
  if (!state.balances[action.caller]) {
    state.balances[action.caller] = 0;
  }
  state.balances[action.caller] += state.claimable[idx].qty;
  state.claimable = reject(propEq(action.input.txID, "txID"), state.claimable);
  return { state };
}
