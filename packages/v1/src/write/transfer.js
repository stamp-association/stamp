import { of, Left, Right } from "../lib/either.js";

export function transfer(state, action) {
  return of({ state, action }).chain(validate).map(trade);
}

function trade({ state, action }) {
  const targetBalance = state.balances[action.input.target]
    ? state.balances[action.input.target]
    : 0;
  return {
    state: {
      ...state,
      balances: {
        ...state.balances,
        [action.caller]: state.balances[action.caller] - action.input.qty,
        [action.input.target]: targetBalance + action.input.qty,
      },
    },
  };
}

function validate({ state, action }) {
  if (!action.caller || action.caller.length !== 43) {
    return Left("Caller is not valid");
  }

  if (!action.input.qty || typeof action.input.qty !== "number") {
    return Left("qty is not defined or is not a number");
  }

  if (!action.input.target || action.input.target.length !== 43) {
    return Left("target is not valid");
  }

  if (action.caller === action.input.target) {
    return Left("target cannot be caller");
  }

  if (
    !state.balances[action.caller] ||
    typeof state.balances[action.caller] !== "number" ||
    state.balances[action.caller] < action.input.qty
  ) {
    return Left("not enough balance to transfer");
  }

  return Right({ state, action });
}
