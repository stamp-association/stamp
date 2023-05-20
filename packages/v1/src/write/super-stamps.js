import { of, Resolved, Rejected, fromPromise, all } from "../lib/async.js";
import { allocate } from "../lib/allocate.js";

const ANNUAL_BLOCKS = 720 * 365;

export function superStamps(env) {
  return ({ state, action }) => {
    return of({ state, action })
      .chain(isSuperStamp)
      .chain(getBalances(env.readState))
      .map(calculateRewards)
      .map(({ state, action, balances, rewards, credits, fee }) => {
        const results = allocate(balances, rewards);
        // update tip
        Object.keys(results).forEach((k) => {
          if (!state.balances[k]) {
            state.balances[k] = 0;
          }
          state.balances[k] += results[k];
        });
        if (!state.balances[env.contractId]) {
          state.balances[env.contractId] = 0;
        }
        state.balances[env.contractId] += fee;
        return { state, action, balances, credits };
      })
      .map(updateCredits(env.height))
      .bichain(noSuperRejection(state), Resolved);
  };
}

function updateCredits(height) {
  return ({ state, action, balances, credits }) => {
    const fbh = height + ANNUAL_BLOCKS;
    if (!state.credits) {
      state.credits = {};
    }
    if (credits > 0) {
      const results = allocate(balances, credits);
      Object.keys(results).forEach((holder) => {
        if (!state.credits[fbh]) {
          state.credits[fbh] = [];
        }
        state.credits[fbh] = state.credits[fbh].concat([
          {
            holder: holder,
            qty: results[holder],
            asset: action.input.tx,
          },
        ]);
      });
    }
    return { state, action };
  };
}

function calculateRewards({ state, action, balances }) {
  const [rewards, credits, fee] = divideQty(action.input.qty);
  return { state, action, balances, rewards, credits, fee };
}

function getBalances(readState) {
  return ({ state, action }) => {
    if (action?.input?.tx && state.assets[action.input.tx]) {
      return Resolved({
        state,
        action,
        balances: state.assets[action.input.tx].balances,
      });
    } else if (action?.input?.tx) {
      return fromPromise(readState)(action?.input?.tx).map((s) => ({
        state,
        action,
        balances: s.balances,
      }));
    }
    return Rejected("NOT_SUPER_STAMP");
  };
}

function isSuperStamp({ state, action }) {
  // no qty specified
  if (!action.input.qty) {
    return Rejected("NOT_SUPER_STAMP");
  }
  if (!state.balances[action.caller]) {
    state.balances[action.caller] = 0;
  }
  if (state.balances[action.caller] < action.input.qty) {
    return Rejected("NOT_SUPER_STAMP");
  }
  return Resolved({ state, action });
}

function noSuperRejection(state) {
  return (msg) => {
    if (typeof msg === "string" && msg === "NOT_SUPER_STAMP") {
      return Resolved({ state });
    }
    return Rejected(msg);
  };
}

function divideQty(n) {
  if (n < 1) {
    return [0, 0, 0];
  }
  return [Math.floor(n * 0.8), Math.floor(n * 0.18), Math.floor(n * 0.02)];
}
