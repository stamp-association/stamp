import { of, Rejected, Resolved, fromPromise } from "../lib/async.js";

export function allow(env) {
  // const get = fromPromise(env.get);
  // const put = fromPromise(env.put);
  const id = env.id;
  const contractId = env.contractId;

  return (state, action) => {
    return of({ state, action })
      .chain(validate(contractId))
      .map(({ state, action }) => {
        state.balances[action.caller] -= action.input.qty;
        if (!state.claimable) {
          state.claimable = [];
        }
        state.claimable.push({
          from: action.caller,
          to: action.input.target,
          qty: action.input.qty,
          txID: id,
        });
        return { state };
      });
    //.chain(appendClaimable(id, get, put));
  };
}

// function appendClaimable(txId, get, put) {
//   return ({ state, action }) => {
//     return get(action.caller)
//       .chain((balance = 0) => put(action.caller, balance - action.input.qty))
//       .map((_) => {
//         if (!state.claimable) {
//           state.claimable = [];
//           state.claimable.push({
//             from: action.caller,
//             to: action.input.target,
//             qty: action.input.qty,
//             txID: txId,
//           });
//           return { state };
//         }
//       });
//   };
// }

function validate(contractId) {
  return ({ state, action }) => {
    if (!Number.isInteger(action.input.qty) || action.input.qty === undefined) {
      return Rejected("Invalid value for quantity. Must be an integer.");
    }
    if (!action?.input?.target) {
      return Rejected("No target specified.");
    }
    if (action.input.target.length !== 43) {
      return Rejected("Target is not valid!");
    }
    if (action.input.target === contractId) {
      return Rejected("Cant setup claim to transfer a balance to itself");
    }
    if (action.caller === action.input.target) {
      return Rejected("Invalid balance transfer");
    }
    if (!state.balances[action.caller]) {
      return Rejected("Caller does not have a balance");
    }
    if (state.balances[action.caller] < action.input.qty) {
      return Rejected("Caller balance is not high enough.");
    }
    return Resolved({ state, action });
    // Deal with balance check
    // return get(action.caller).chain((balance = 0) =>
    //   balance < action.input.qty
    //     ? Rejected("Caller balance is not high enough.")
    //     : Resolved({ state, action })
    // );
  };
}
