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

//const REWARD = 1000_000_000;
const TOTAL_SUPPLY = 435000 * 1e12;
const HALVING_SUPPLY = 315328 * 1e12;
const ORIGIN_HEIGHT = 1178473;
const CYCLE_INTERVAL = 1051200;

// reward sponsors of stamped assets
export function reward(env) {
  const readState = fromPromise(env.readState);
  return (state, action) =>
    of({ state, action })
      // make sure there is enough supply
      .chain(setReward(env.height))
      // check last block height from this current block height
      .chain(({ state, action, reward }) =>
        state.lastReward + 720 < env.height // + 720
          ? Resolved({ state, action, reward })
          : Rejected(state)
      )
      .map(mintRewardsForStamps)

      // distributeRegisteredAssets
      //.map(allocateRegisteredAssets)
      // distributeAtomicAssets
      .chain(allocateAtomicAssets(readState, env.contractId))
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

function setReward(height) {
  return ({ state, action }) => {
    const S100 = 1 * 1e12;

    const current = sum(values(state.balances)) || 0;

    if (current >= HALVING_SUPPLY) {
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
    const reward = getReward(
      HALVING_SUPPLY,
      CYCLE_INTERVAL,
      height,
      ORIGIN_HEIGHT
    );
    return Resolved({ state, action, reward });
  };
}

function updateBalances(context) {
  const rewardList = compose(
    reduce((a, v) => [...a, ...toPairs(v)], []),
    values
  )(context.rewards);
  rewardList.forEach(([address, reward]) => {
    if (!context.state.balances[address]) {
      context.state.balances[address] = 0
    }
    context.state.balances[address] += reward
  })
  return context
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

function allocateAtomicAssets(readState, contractId) {
  return ({ state, action, rewards }) =>
    all(
      compose(
        map(([asset, reward]) =>
          is(Number, reward)
            ? readState(asset)
              .map(x => (console.log('state: ', x), x))
              .map((assetState) => {
                return assetState.balances
                  ? allocate(assetState.balances, reward)
                  : allocate({ [assetState.owner || contractId]: 1 }, reward);
              })
              .map(x => (console.log('rewards: ', x), x))
              //.map(({ balances }) => allocate(balances, reward))
              .map((r) => [asset, r])
              .bichain(
                (e) => {
                  return Resolved([
                    asset,
                    {
                      [contractId]: reward,
                    },
                  ])
                }
                ,
                Resolved
              )
            : Resolved([asset, reward])
        ),
        toPairs
      )(rewards)
    )
      .map(x => (console.log('pairs: ', x), x))
      .map((pairs) => ({ state, action, rewards: fromPairs(pairs) }));
}

function getReward(supply, interval, currentHeight, originHeight) {
  const blockHeight = currentHeight - originHeight;
  const currentCycle = Math.floor(blockHeight / interval) + 1;
  const divisor = Math.pow(2, currentCycle);
  const reward = Math.floor(Math.floor(supply / divisor) / 1.73 / 365);
  // Debug
  // console.log({ supply, interval, currentHeight, originHeight })
  // console.log('blockHeight', blockHeight)
  // console.log('current cycle', currentCycle)
  // console.log('divisor', divisor)
  // console.log('reward', reward)
  return reward;
}
