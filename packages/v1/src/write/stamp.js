import { of, fromPromise, Rejected, Resolved } from "../lib/async.js";
import { set, lensPath, compose, prop, find, propEq } from "ramda";

export function stamp({ readState, tags }) {
  const tx = compose(prop("value"), find(propEq("Data-Source", "name")))(tags);

  const addDataSource = set(lensPath(["action", "input", "tx"]), tx);

  const read = fromPromise(readState);
  return (state, action) =>
    of({ state, action })
      .map(addDataSource)
      .chain(validate)
      // TODO: handle super stamps

      .chain(isVouched(read))
      .chain(update);
}

function validate({ state, action }) {
  if (action.caller.length !== 43) {
    return Rejected("Caller is not found");
  }
  if (!action.input.tx || action.input.tx.length !== 43) {
    return Rejected("Data-Source Tag must be set to a transaction");
  }
  return Resolved({ state, action });
}

function isVouched(read) {
  return ({ state, action }) =>
    read(state.vouchDAO)
      .map(prop("vouched"))
      .map(prop(action.caller))
      .chain((res) =>
        res ? Resolved({ state, action }) : Rejected("Caller is not vouched!")
      );
}

function update({ state, action }) {
  //const queue = state.stamps[action.input.tx] || []
  //state.stamps[action.input.tx] = uniq([...queue, action.caller])
  //state.stamps[`${action.input.tx}:${action.caller}`]
  return Resolved({
    state: set(
      lensPath(["stamps", `${action.input.tx}:${action.caller}`]),
      { asset: action.input.tx, address: action.caller },
      state
    ),
  });
}
