import { AddPair, CancelOrder, CreateOrder, Halt, ReadOutbox } from "@verto/flex";
import { verified } from 'vouch-verified'

import map from 'ramda/src/map'
import assoc from 'ramda/src/assoc'
import head from 'ramda/src/head'
import keys from 'ramda/src/keys'
import values from 'ramda/src/values'

import {
  StampInterface,
  StateInterface,
  ActionInterface,
  BalanceInterface,
  ForeignCallInterface,
} from "./faces";

import { mintRewards, pstAllocation } from './utils'

const functions = { evolve, stamp, reward, transfer, balance }

const REWARD = 1000_000_000_000_000

export async function handle(
  state: StateInterface,
  action: ActionInterface
): Promise<{ state: StateInterface } | { result: BalanceInterface }> {

  if (action.input.function === 'addPair') {
    const s = await AddPair(state, action)
    return { state: s }
  }

  if (action.input.function === 'cancelOrder') {
    const s = await CancelOrder(state, action)
    return { state: s }
  }

  if (action.input.function === 'createOrder') {
    const resultObj = await CreateOrder(state, action)
    return { state: resultObj.state }
  }

  if (action.input.function === 'halt') {
    const s = await Halt(state, action)
    return { state: s }
  }

  if (action.input.function === 'readOutbox') {
    const s = await ReadOutbox(state, action)
    return { state: s }
  }

  if (Object.keys(functions).includes(action.input.function)) {
    return functions[action.input.function](state, action)
  }

  throw new ContractError(`${action.input.function} function not implemented!`)

}

async function reward(state: StateInterface, action: ActionInterface): Promise<{ state: StateInterface }> {
  const caller = action.caller;
  ContractAssert(action.input.timestamp, 'Timestamp is required for reward processing.')
  // STEP 1a - verify contract caller is creator
  ContractAssert(caller === state.creator, 'Only coin creator can run reward function!')
  // STEP 2 - get all stamps that are not flagged true
  const newStampValues = Object.values(state.stamps).filter(stamp => stamp.flagged === false);
  // STEP 3 - aggregate by asset identifier (Asset)
  // STEP 4 - Calculate reward points/coins
  const rewards = mintRewards(newStampValues, REWARD)

  // create reward log for audit purposes
  state.rewardLog = Object.entries(rewards).reduce((a, [asset, coins]) => {
    return [...a, { asset, coins, timestamp: action.input.timestamp }]
  }, state.rewardLog || [])

  // STEP 5 - for each reward, readContractState, distribute rewards via PST owners
  const allocations = await Promise.all(map(
    async ([asset, coins]) => {
      try {
        const x = await SmartWeave.contracts.readContractState(asset)
        // apply balances
        if (x.balances && Object.keys(x.balances).length > 0) {
          const r = pstAllocation(x.balances, coins)
          delete r[undefined]
          console.log(r)
          return r
        }
        console.log('could not allocate reward to ' + asset)
        return null
      } catch (e) {
        console.log(e)
        return null
      }
    },
    Object.entries(rewards)
  )).then(a => a.filter(o => o !== null))

  // need to apply allocations to state balance
  allocations.forEach(o => {
    Object.entries(o).forEach(([addr, v]) => {
      state.balances[addr] ? state.balances[addr] += v : state.balances[addr] = v
    })
  })
  // STEP 6 - flag all stamps as rewarded or flagged = true
  state.stamps = map(assoc('flagged', true), state.stamps)

  return { state }
}

async function stamp(state: StateInterface, action: ActionInterface) {
  const caller = action.caller;
  const stamps = state.stamps;
  const transactionId = action.input.transactionId
  ContractAssert(transactionId, 'transactionId is required!')

  // already stamped by user
  if (stamps[`${caller}:${transactionId}`]) {
    throw new ContractError("Already Stamped Asset!")
  }

  const vouchServices = Object.keys(await verified(state, action))
  // check for ANS-109 vouch record for caller that is owned by vouchServices.

  const query = `
 query {
  transactions(owners: [${vouchServices.map(s => `"${s}"`)}], tags: {name: "Vouch-For", values: ["${caller}"]}) {
    edges {
      node {
        id
        tags {
          name
          value
        }
      }
    }
  }
 } 
  `
  // if ANS-109...
  const result = await SmartWeave.unsafeClient.api.post('graphql', { query })
  const edges = result?.data?.data?.transactions?.edges || []
  if (edges.length < 1) {
    throw new ContractError('Could not vouch caller!')
  }

  const node = edges[0].node;
  const vouchFor = node.tags.find((t) => t.name === "Vouch-For")?.value;
  if (vouchFor === caller) {
    state.stamps[`${caller}:${transactionId}`] = {
      timestamp: action.input.timestamp,
      asset: transactionId,
      address: caller,
      flagged: false
    };
  }
  return { state };
}

function transfer(state, action) {
  const balances = state.balances;
  const input = action.input;
  const caller = action.caller;

  const target = input.target;
  const quantity = input.qty;

  if (!Number.isInteger(quantity) || quantity === undefined) {
    throw new ContractError(
      "Invalid value for quantity. Must be an integer."
    );
  }
  if (!target) {
    throw new ContractError("No target specified.");
  }
  if (quantity <= 0 || caller === target) {
    throw new ContractError("Invalid token transfer.");
  }
  if (balances[caller] < quantity) {
    throw new ContractError(
      "Caller balance not high enough to send " + quantity + " token(s)."
    );
  }

  balances[caller] -= quantity;
  if (target in balances) {
    balances[target] += quantity;
  } else {
    balances[target] = quantity;
  }

  return { state };
}

function evolve(state: StateInterface, action: ActionInterface) {
  if (state.canEvolve) {
    if (state.creator === action.caller) {
      state.evolve = action.input.value
    }
  }
  return { state }
}

function balance(state: StateInterface, action: ActionInterface) {
  const balances = state.balances;
  const input = action.input;
  const caller = action.caller;

  let target;
  if (!input.target) {
    target = caller;
  } else {
    target = input.target;
  }
  const ticker = state.ticker;

  if (typeof target !== "string") {
    throw new ContractError("Must specify target to get balance for.");
  }
  if (typeof balances[target] !== "number") {
    throw new ContractError("Cannot get balance; target does not exist.");
  }

  return {
    result: {
      target,
      ticker,
      balance: balances[target],
    },
  };
}
