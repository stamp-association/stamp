import { AddPair, CancelOrder, CreateOrder, Halt } from "@verto/flex";

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

import { mintRewards, pstAllocation, divideQty, rewardCredits } from './utils'

const functions = { evolve, stamp, reward, transfer, balance }

const REWARD = 1000_000_000_000_000
const VOUCH_DAO = '_z0ch80z_daDUFqC9jHjfOL8nekJcok4ZRkE_UesYsk'
const ANNUAL_BLOCKS = 720 * 365

export async function handle(
  state: StateInterface,
  action: ActionInterface
): Promise<{ state: StateInterface } | { result: BalanceInterface }> {
  const balances = state.balances;
  const claimable = state.claimable || [];
  const claims = state.claims || [];
  const input = action.input;
  const caller = action.caller;

  if (input.function === "allow") {
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
        "Caller balance not high enough to make claimable " +
        quantity +
        " token(s)."
      );
    }

    balances[caller] -= quantity;
    claimable.push({
      from: caller,
      to: target,
      qty: quantity,
      txID: SmartWeave.transaction.id,
    });

    return { state };
  }

  if (input.function === "claim") {
    // Claim input: txID
    const txID = input.txID;
    // Claim qty
    const qty = input.qty;

    // Check to make sure it hasn't been claimed already
    for (let i = 0; i < claims.length; i++) {
      if (claims[i] === txID) {
        return { state }
        //throw new ContractError("This claim has already been made");
      }
    }

    if (!claimable.length) {
      throw new ContractError("Contract has no claims available");
    }
    // Search for txID inside of `claimable`
    let obj, index;
    for (let i = 0; i < claimable.length; i++) {
      if (claimable[i].txID === txID) {
        index = i;
        obj = claimable[i];
      }
    }
    if (obj === undefined) {
      throw new ContractError("Unable to find claim");
    }
    if (obj.to !== caller) {
      throw new ContractError("Claim not addressed to caller");
    }
    if (obj.qty !== qty) {
      throw new ContractError("Claiming incorrect quantity of tokens");
    }
    // Check to make sure it hasn't been claimed already
    for (let i = 0; i < claims.length; i++) {
      if (claims[i] === txID) {
        throw new ContractError("This claim has already been made");
      }
    }

    if (balances[caller] === undefined) {
      balances[caller] = 0;
    }
    // Not already claimed --> can claim
    balances[caller] += obj.qty;

    // remove from claimable
    claimable.splice(index, 1);

    // add txID to `claims`
    claims.push(txID);

    return { state };
  }

  if (input.function === "addPair") {
    const _ = await AddPair(state, action)
    return { state: _.state };
  }

  if (input.function === "cancelOrder") {
    const _ = await CancelOrder(state, action)
    return { state: _.state };
  }

  if (input.function === "createOrder") {
    const _ = await CreateOrder(state, action);
    return { state: _.state }
  }

  if (input.function === "halt") {
    const _ = await Halt(state, action);
    return { state: _.state };
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
  const newStampValues = Object.values(state.stamps)
    .filter(stamp => stamp.flagged === false)
    // only vouched stamps get rewarded
    .filter(stamp => stamp.vouched === true)
    .filter(s => s.asset?.length === 43);
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
          return r
        }
        console.log('could not allocate reward to ' + asset)
        return null
      } catch (e) {
        console.log('Could not read contract state of ' + asset + ' - ' + e.message)
        return null
      }
    },
    Object.entries(rewards)
  )).then(a => a.filter(o => o !== null))

  // need to apply allocations to state balance
  allocations.forEach(o => {
    Object.entries(o).forEach(([addr, v]) => {
      if (state.balances[addr]) {
        state.balances[addr] += v
      } else {
        state.balances[addr] = v
      }
    })
  })
  // STEP 6 - flag all stamps as rewarded or flagged = true
  state.stamps = map(assoc('flagged', true), state.stamps)

  // handle credits
  if (state.credits) {
    state = rewardCredits(state, SmartWeave.block.height)
  }

  return { state }
}

async function stamp(state: StateInterface, action: ActionInterface) {
  const caller = action.caller;
  const stamps = state.stamps;
  const transactionId = action.input.transactionId
  const qty = action.input.qty || 0

  const callerBalance = state.balances[action.caller] || 0

  // initialize credits object to state
  if (!state.credits) {
    state.credits = {}
  }

  ContractAssert(transactionId, 'transactionId is required!')
  ContractAssert(transactionId.length === 43, 'transactionId must be valid!')

  // if super stamp request check callers balance
  if (qty > 0 && qty > callerBalance) {
    throw new ContractError('Not enough tokens to SuperStamp!')
  }

  // already stamped by user
  if (stamps[`${caller}:${transactionId}`]) {
    throw new ContractError("Already Stamped Asset!")
  }
  // anyone can stamp, but only vouched users count for rewards
  const vouchDAOstate = await SmartWeave.contracts.readContractState(VOUCH_DAO)
  //ContractAssert(vouchDAOstate.vouched[caller], 'This wallet is not allowed to STAMP! caller is not vouched!')
  const vouched = Boolean(vouchDAOstate.vouched[caller].length)
  // do super stamp
  if (qty > 0) {
    // is super stamp 
    // get asset holders from asset
    const assetState = await SmartWeave.contracts.readContractState(transactionId)
    // remove rewards from caller
    state.balances[caller] -= qty
    // divide super stamp tokens in to 80% and 20% buckets
    const [rewards, credits] = divideQty(qty)
    // send 80% to asset holders
    if (assetState.balances && Object.keys(assetState.balances).length > 0) {
      const r = pstAllocation(assetState.balances, rewards)
      delete r[undefined]

      // apply rewards to asset holders
      Object.keys(r).forEach(holder => state.balances[holder] = (state.balances[holder] || 0) + r[holder])

    }
    // send 20% to credit queue
    if (assetState.balances && Object.keys(assetState.balances).length > 0) {
      const fbh = SmartWeave.block.height + ANNUAL_BLOCKS
      const c = pstAllocation(assetState.balances, credits)
      delete c[undefined]
      console.log({ c, credits })
      // apply credits to asset holders
      Object.keys(c).forEach(holder => {
        // TODO: current block height + ANNUAL_BLOCKS
        if (!state.credits[fbh]) {
          state.credits[fbh] = []
        }
        state.credits[fbh] = state.credits[fbh].concat([{
          holder: holder,
          qty: c[holder],
          asset: transactionId
        }])
      })

    }
  }

  state.stamps[`${caller}:${transactionId}`] = {
    height: SmartWeave.block.height,
    timestamp: SmartWeave.block.timestamp,
    asset: transactionId,
    address: caller,
    vouched,
    super: qty > 0,
    flagged: false
  };

  return { state };
}

function transfer(state: StateInterface, action: ActionInterface) {
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
  if (!(caller in balances)) {
    throw new ContractError("Caller doesn't own any balance.");
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
