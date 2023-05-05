import { set, lensPath } from "ramda";

import { of } from "../lib/either.js";

/**
 * registers tx that does not have a contract
 *
 */
export function register(env) {
  const setTx = set(lensPath(["action", "input", "tx"]), env.id);
  return (state, action) => of({ state, action }).map(setTx).map(add);
}

function add({ state, action }) {
  return {
    state: set(
      lensPath(["assets", action.input.tx, "balances", action.caller]),
      1,
      state
    ),
  };
}
