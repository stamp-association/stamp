import { of, Left, Right } from "../lib/either.js";
import { set, lensPath } from "ramda";

export function balance(state, action) {
  return of({ state, action }).chain(validate).map(read);
}

function validate({ state, action }) {
  if (!action.caller || action.caller.length !== 43) {
    return Left("Caller is not valid");
  }
  if (!action.input.target) {
    return Right({
      state,
      action: set(lensPath(["input", "target"]), action.caller, action),
    });
  }
  return Right({ state, action });
}

function read({ state, action }) {
  return {
    result: {
      target: action.input.target,
      balance: state.balances[action.input.target] || 0,
    },
  };
}
