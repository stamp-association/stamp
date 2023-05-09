import { of, Resolved, Rejected, fromPromise } from "../lib/async.js";
import { allocate } from "../lib/allocate.js";

const ANNUAL_BLOCKS = 720 * 365;

export function superStamps({ readState, height }) {
  return ({ state, action }) => {
    return of({ state, action })
      .chain(isSuperStamp)
      .chain(getBalances(readState))
      .map(calculateRewards)
      .map(transferRewards)
      .map(updateCredits(height))
      .bichain(handleNoSuperRejection(state), Resolved);
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

function transferRewards({ state, action, balances, rewards, credits }) {
  // allocate rewards to balances
  const results = allocate(balances, rewards);
  // update balances
  Object.keys(results).forEach((k) => {
    if (!state.balances[k]) {
      state.balances[k] = 0;
    }
    state.balances[k] += results[k];
  });

  return { state, action, balances, credits };
}

function calculateRewards({ state, action, balances }) {
  const [rewards, credits] = divideQty(action.input.qty);
  return { state, action, balances, rewards, credits };
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
  // balance not available
  if (!state.balances[action.caller]) {
    return Rejected("NOT_SUPER_STAMP");
  }
  // not enough balance to transfer
  if (state.balances[action.caller] < action.input.qty) {
    return Rejected("NOT_SUPER_STAMP");
  }
  return Resolved({ state, action });
}

function handleNoSuperRejection(state) {
  return (msg) => {
    if (typeof msg === "string" && msg === "NOT_SUPER_STAMP") {
      return Resolved({ state });
    }
    return Rejected(msg);
  };
}
function handleSuperStamps({ state, action }) {
  // no qty specified
  if (!action.input.qty) {
    return Resolved({ state, action });
  }
  // balance not available
  if (!state.balances[action.caller]) {
    return Resolved({ state, action });
  }
  // not enough balance to transfer
  if (state.balances[action.caller] < action.input.qty) {
    return Resolved({ state, action });
  }

  const [superQty, credits] = divideQty(qty);

  if (!state.supers) {
    state.supers = {};
  }

  state.supers[`${action.input.tx}:${action.caller}`] = {
    asset: action.input.tx,
    qty: superQty,
  };

  if (!state.credits) {
    state.credits = {};
  }

  state.credits[`${action.input.tx}:${action.caller}`] = {
    asset: action.input.tx,
    qty: credits,
  };

  return Resolved({ state, action });
}

function divideQty(n) {
  if (n < 1) {
    return [0, 0];
  }
  return [Math.floor(n * 0.8), Math.floor(n * 0.2)];
}
