import { AddPair, CancelOrder, CreateOrder, Halt } from "@verto/flex";
import { map, assoc, propEq } from 'ramda'
import { mintRewards, pstAllocation, divideQty, rewardCredits } from './utils.js'

const functions = { evolve, stamp, reward, transfer, balance, originCount, stampCountByAsset, stampsByAsset, stampsByAddress }

const REWARD = 1000_000_000_000_000
const VOUCH_DAO = '_z0ch80z_daDUFqC9jHjfOL8nekJcok4ZRkE_UesYsk'
const ARNS = 'bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U'
const ANNUAL_BLOCKS = 720 * 365

export async function handle(
  state,
  action
) {
  const balances = state.balances;
  const input = action.input;
  const caller = action.caller;

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

async function reward(state, action) {
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
        if (asset === '8iZh2EveCFkMeKJyKkln_WcQtfuF9YihQe3wc0ic9QA') {
          console.log('could not allocate reward to ' + asset)
          return null
        }
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

async function stamp(state, action) {
  let caller = action.caller;
  if (caller === state.creator) {
    caller = action.input.target || state.creator
  }

  const stamps = state.stamps;
  const transactionId = action.input.transactionId
  const qty = action.input.qty || 0
  const callerBalance = state.balances[action.caller] || 0
  const subdomain = action.input.subdomain || ''


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
  const vouched = Boolean(vouchDAOstate.vouched[caller])
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

  if (subdomain !== '') {
    const arns = await SmartWeave.contracts.readContractState(ARNS)
    // find ANT
    const ANT = arns.records[subdomain]
    if (ANT) {
      // readstate of ArNS TEST
      const ant = await SmartWeave.contracts.readContractState(ANT)
      // find ANT Record
      const antOwner = ant.owner
      // need to verify the transaction id is in ANT Contract
      if (Object.values(ant.records).map(v => typeof v === 'string' ? v : v.transactionId).includes(transactionId)) {
        state.stamps[`${caller}:${transactionId}`] = {
          ant: ANT,
          antOwner: antOwner,
          ...state.stamps[`${caller}:${transactionId}`]
        }
      }

    }
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

function evolve(state, action) {
  if (state.canEvolve) {
    if (state.creator === action.caller) {
      state.evolve = action.input.value
    }
  }
  return { state }
}

function balance(state, action) {
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

async function originCount(state, action) {
  if (!action.input.subdomain) {
    throw ContractError('subdomain is required')
  }
  const arns = await SmartWeave.contracts.readContractState(ARNS)
  // find ANT
  const ANT = arns.records[action.input.subdomain]
  if (!ANT) {
    throw ContractError('could not find ANT')
  }
  const count = Object.values(state.stamps).filter(propEq('ant', ANT)).length
  return { result: count }
}

function stampCountByAsset(state, action) {
  const stamps = Object.values(state.stamps).filter(propEq('asset', action.input.asset))
  return {
    result: {
      count: stamps.length,
      vouched: stamps.filter(propEq('vouched', true)).length,
      super: stamps.filter(propEq('super', true)).length
    }
  }
}

function stampsByAsset(state, action) {
  const stamps = Object.values(state.stamps).filter(propEq('asset', action.input.asset))
  return {
    result: { stamps }
  }
}


function stampsByAddress(state, action) {
  const stamps = Object.values(state.stamps).filter(propEq('asset', action.input.target || action.caller))
  return {
    result: { stamps }
  }
}