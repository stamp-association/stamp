import { of, Rejected, Resolved, fromPromise } from "../lib/async.js";
import { set, lensPath } from "ramda";

export function balance(env) {
  //const get = fromPromise(env.get);
  return (state, action) => {
    return of({ state, action })
      .chain(validate)
      .map(({ state, action }) => ({
        result: {
          target: action.input.target,
          balance: state.balances[action.input.target] || 0,
        },
      }));
    // .chain(({ state, action }) =>
    //   get(action.input.target).map((v = 0) => ({
    //     result: {
    //       target: action.input.target,
    //       balance: v,
    //     },
    //   }))
    // );
  };
}

function validate({ state, action }) {
  if (!action.caller || action.caller.length !== 43) {
    return Rejected("Caller is not valid");
  }
  if (!action.input.target) {
    return Resolved({
      state,
      action: set(lensPath(["input", "target"]), action.caller, action),
    });
  }
  return Resolved({ state, action });
}

// function read({ state, action }) {
//   return {
//     result: {
//       target: action.input.target,
//       balance: state.balances[action.input.target] || 0,
//     },
//   };
// }
