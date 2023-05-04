import { of, fromPromise, Rejected, Resolved } from '../lib/async.js'
import { set, lensPath } from 'ramda'

// reward sponsors of stamped assets
export function reward(env) {
  return (state, action) => of({ state, action })
    // check last block height from this current block height
    .chain(({ state, action }) => (state.lastReward + 720) < env.height
      ? Resolved({ state, action })
      : Rejected(state)
    )
    // if current block height is greater than 720 then run 
    // reward process
    //
    //
    // gather all of the stamped transactions
    // iterate over each one
    // get owner either from state or from registry
    // distribute 1000 tokens
    // for each asset awarded distribute rewards to sponsors

    // clear stamps queue
    .map(set(lensPath(['state', 'stamps']), {}))
    // set lastReward Height
    .map(set(lensPath(['state', 'lastReward']), env.height))
    // return new state

    .bichain(_ => Resolved(state), ({ state, action }) => Resolved(state))
}