import { of, Rejected, Resolved, fromPromise } from "../lib/async.js";

export function transfer(env) {
  const get = fromPromise(env.get);
  const put = fromPromise(env.put);
  return (state, action) => {
    return of({ state, action })
      .chain(validate(get))
      .chain(subtractCallerBalance(get, put))
      .chain(addTargetBalance(get, put))
      .map(({ state, action }) => ({ state }));
  };
}

function subtractCallerBalance(get, put) {
  return ({ state, action }) => {
    return get(action.caller)
      .chain((balance = 0) => put(action.caller, balance - action.input.qty))
      .map((_) => ({ state, action }));
  };
}

function addTargetBalance(get, put) {
  return ({ state, action }) => {
    return get(action.input.target)
      .chain((balance = 0) =>
        put(action.input.target, balance + action.input.qty)
      )
      .map((_) => ({ state, action }));
  };
}

function validate(get) {
  return ({ state, action }) => {
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

    return get(action.caller).chain((v = 0) =>
      v < action.input.qty
        ? Rejected("not enough balance to transfer")
        : Resolved({ state, action })
    );
  };
}
