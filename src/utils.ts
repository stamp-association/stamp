import filter from 'ramda/src/filter'
import propEq from 'ramda/src/propEq'
import length from 'ramda/src/length'
import reduce from 'ramda/src/reduce'
import assoc from 'ramda/src/assoc'
import values from 'ramda/src/values'
import keys from 'ramda/src/keys'
import add from 'ramda/src/add'
import mergeAll from 'ramda/src/mergeAll'
import map from 'ramda/src/map'
import pluck from 'ramda/src/pluck'
import prop from 'ramda/src/prop'
import groupBy from 'ramda/src/groupBy'
import toPairs from 'ramda/src/toPairs'
import flatten from 'ramda/src/flatten'

import {
  StampInterface,
} from "./faces";

export function mintRewards(stamps: Array<StampInterface>, reward: number) {
  const stampers = groupBy(prop('address'), stamps)
  //const assets = groupBy(byAsset, stamps)
  const totalUniqueStampers = length(keys(stampers))
  var mintRemainder = reward % Number(totalUniqueStampers)
  // if totalUniqueStampers === 0 ? do what ??
  const allocationFactor = Number(reward) / Number(totalUniqueStampers)

  return map(([_, value]) => {
    var rewardsFromStamper = allocationFactor * Number(reward)
    if (mintRemainder > 0) {
      rewardsFromStamper++;
      mintRemainder--;
    }
    var stamperRemainder = rewardsFromStamper % value.length
    const stamperAllocationFactor = Number(rewardsFromStamper) / Number(value.length)
    return flatten(map(asset => {
      var rewardsForAsset = stamperAllocationFactor * Number(rewardsFromStamper)
      if (stamperRemainder > 0) {
        rewardsForAsset++
        stamperRemainder--
      }
      return [asset, rewardsForAsset]
    },
      pluck('asset', value)
    ))

  },

    toPairs(stampers)
  ).reduce((a, [asset, reward]) => a[asset] ? assoc(asset, a[asset] + reward, a) : assoc(asset, reward, a), {})
}

export function rewardAllocation(stamps: Array<StampInterface>, reward: number) {
  return reduce((a: Array<Record<string, number>>, s: StampInterface) => {
    const total = length(stamps)
    const balance = length(filter(propEq('asset', s.asset)), stamps)
    const pct = Math.round(balance / total * 100)
    const coins = Math.round(reward * (pct / 100))
    return a[s.asset] ? assoc(s.asset, a[s.asset] + coins, a) : assoc(s.asset, coins, a)
  }, {}, stamps)
}

export function pstAllocation(balances: Record<string, number>, reward: number) {
  const total = reduce(add, 0, values(balances))
  return mergeAll(reduce((a: Array<any>, s: Array<any>) => {
    const asset = s[0]
    const balance = s[1]

    // handle zero balance
    if (balance < 1) { return a }

    // what is best practice for safety here with floating points? 
    // I think they should round up to an integer.
    const pct = Math.round(balance / total * 100)
    const coins = Math.round(reward * (pct / 100))

    return [...a, { [asset]: Number(coins) }]
  }, [], Object.entries(balances)))
}