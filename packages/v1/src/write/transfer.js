import { of, Rejected, Resolved, fromPromise } from "../lib/async.js";

export function transfer(state, action) {
  return of({ state, action })
    .chain(validate)
    .map(({ state, action }) => {
      state.balances[action.caller] -= action.input.qty;
      state.balances[action.input.target] += action.input.qty;
      return { state };
    });
}

function validate({ state, action }) {
  if (!action.caller || action.caller.length !== 43) {
    return Rejected("Caller is not valid");
  }

  if (!action.input.qty || typeof action.input.qty !== "number") {
    return Rejected("qty is not defined or is not a number");
  }

  if (!action.input.target || action.input.target.length !== 43) {
    return Rejected("target is not valid");
  }

  if (action.caller === action.input.target) {
    return Rejected("target cannot be caller");
  }

  if (!state.balances[action.input.target]) {
    state.balances[action.input.target] = 0;
  }
  if (!state.balances[action.caller]) {
    state.balances[action.caller] = 0;
  }

  if (state.balances[action.caller] < action.input.qty) {
    return Rejected("not enough balance to transfer");
  }
  return Resolved({ state, action });
}
