import { of, fromPromise, Rejected, Resolved, all } from "../lib/async.js";
import {
  set,
  lensPath,
  compose,
  values,
  prop,
  toPairs,
  fromPairs,
  lensProp,
  over,
  map,
  is,
  reduce,
  flatten,
  sum,
} from "ramda";
import { mint } from "../lib/mint.js";
import { allocate } from "../lib/allocate.js";

const REWARD = 1000_000_000;
const SUPPLY = 7665000 * 1e6;

// reward sponsors of stamped assets
export function reward(env) {
  const readState = fromPromise(env.readState);
  return (state, action) =>
    of({ state, action })
      // make sure there is enough supply
      .chain(setReward(env.contractId))
      // check last block height from this current block height
      .chain(({ state, action, reward }) =>
        state.lastReward + 720 < env.height
          ? Resolved({ state, action, reward })
          : Rejected(state)
      )
      .map(mintRewardsForStamps)

      // distributeRegisteredAssets
      .map(allocateRegisteredAssets)
      // distributeAtomicAssets
      .chain(allocateAtomicAssets(readState))
      // update balances
      .map(updateBalances)
      // clear stamps queue
      .map(set(lensPath(["state", "stamps"]), {}))
      // set lastReward Height
      .map(set(lensPath(["state", "lastReward"]), env.height))
      // return new state
      .bichain(
        (_) => Resolved(state),
        ({ state, action }) => Resolved(state)
      );
}

function setReward(contractId) {
  return ({ state, action }) => {
    const S100 = 100 * 1e6;
    const S250 = 250 * 1e6;
    const S500 = 500 * 1e6;
    const S750 = 750 * 1e6;
    const S1000 = 1000 * 1e6;

    const current = sum(values(state.balances)) || 0;
    if (current >= SUPPLY) {
      if (!state.balances[contractId]) {
        state.balances[contractId] = 0;
      }
      // when reward supply is complete use contract balance as
      // reward treasury
      if (state.balances[contractId] > S100) {
        state.balances[contractId] -= S100;
        return Resolved({ state, action, reward: S100 });
      }
      return Rejected(state);
    }
    if (current > Math.floor(SUPPLY, 0.75)) {
      return Resolved({ state, action, reward: S250 });
    }
    if (current > Math.floor(SUPPLY, 0.5)) {
      return Resolved({ state, action, reward: S500 });
    }
    if (current > Math.floor(SUPPLY, 0.25)) {
      return Resolved({ state, action, reward: S750 });
    }
    return Resolved({ state, action, reward: S1000 });
  };
}

function updateBalances(context) {
  const rewardList = compose(
    reduce((a, v) => [...a, ...toPairs(v)], []),
    values
  )(context.rewards);

  return over(
    lensPath(["state", "balances"]),
    (balances) => {
      rewardList.forEach(([address, reward]) => {
        if (!balances[address]) {
          balances[address] = 0;
        }
        balances[address] += reward;
      });
      return balances;
    },
    context
  );
}

function mintRewardsForStamps({ state, action, reward }) {
  return compose(
    (rewards) => ({ state, action, rewards }),
    (s) => mint(s, reward),
    values,
    prop("stamps")
  )(state);
}

function allocateRegisteredAssets(context) {
  return over(
    lensProp("rewards"),
    compose(
      fromPairs,
      map(([asset, reward]) =>
        context.state.assets[asset]
          ? [asset, allocate(context.state.assets[asset].balances, reward)]
          : [asset, reward]
      ),
      toPairs
    ),
    context
  );
}

function allocateAtomicAssets(readState) {
  return ({ state, action, rewards }) =>
    all(
      compose(
        map(([asset, reward]) =>
          is(Number, reward)
            ? readState(asset)
                .map(({ balances }) => allocate(balances, reward))
                .map((r) => [asset, r])
                .bichain(
                  (e) =>
                    Resolved([
                      asset,
                      {
                        ["XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"]: reward,
                      },
                    ]),
                  Resolved
                )
            : Resolved([asset, reward])
        ),
        toPairs
      )(rewards)
    ).map((pairs) => ({ state, action, rewards: fromPairs(pairs) }));
}
