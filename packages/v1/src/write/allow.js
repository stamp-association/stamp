import { of, Left, Right } from "../lib/either.js";

export function allow({ id, contractId }) {
  return (state, action) => {
    return of({ state, action })
      .chain(validate(contractId))
      .map(appendClaimable(id));
  };
}

function appendClaimable(txId) {
  return ({ state, action }) => {
    if (!state.claimable) {
      state.claimable = [];
    }
    // mutate state for speed
    state.balances[action.caller] -= action.input.qty;
    state.claimable.push({
      from: action.caller,
      to: action.input.target,
      qty: action.input.qty,
      txID: txId,
    });
    return { state };
  };
}

function validate(contractId) {
  return ({ state, action }) => {
    if (!Number.isInteger(action.input.qty) || action.input.qty === undefined) {
      return Left("Invalid value for quantity. Must be an integer.");
    }
    if (!action?.input?.target) {
      return Left("No target specified.");
    }
    if (action.input.target.length !== 43) {
      return Left("Target is not valid!");
    }
    if (action.input.target === contractId) {
      return Left("Cant setup claim to transfer a balance to itself");
    }
    if (action.caller === action.input.target) {
      return Left("Invalid balance transfer");
    }
    if (!state.balances[action.caller]) {
      state.balances[action.caller] = 0;
    }
    if (state.balances[action.caller] < action.input.qty) {
      return Left("Caller balance is not high enough.");
    }
    return Right({ state, action });
  };
}
