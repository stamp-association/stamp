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
import sum from 'ramda/src/sum'

import {
  StampInterface,
} from "./faces";

export function mintRewards(stamps, reward) {
  const stampers = groupBy(prop('address'), stamps)
  const totalUniqueStampers = length(keys(stampers))
  var mintRemainder = reward % totalUniqueStampers
  const allocation = parseInt(reward / totalUniqueStampers)

  return flatten(map(([_, value]) => {
    var rewardsFromStamper = allocation
    if (mintRemainder > 0) {
      rewardsFromStamper++;
      mintRemainder--;
    }
    var stamperRemainder = rewardsFromStamper % value.length
    const stamperAllocation = parseInt(rewardsFromStamper / value.length)
    return map(asset => {
      var rewardsForAsset = stamperAllocation
      if (stamperRemainder > 0) {
        rewardsForAsset++
        stamperRemainder--
      }
      return { asset, rewardsForAsset }
    },
      pluck('asset', value)
    )
  },
    toPairs(stampers)
  )).reduce((a, { asset, rewardsForAsset }) => a[asset] ? assoc(asset, a[asset] + rewardsForAsset, a) : assoc(asset, rewardsForAsset, a), {})
}


export function pstAllocation(balances: Record<string, number>, reward: number) {
  var total = reduce(add, 0, values(balances).filter(v => v > 0))

  const allocation = mergeAll(reduce((a: Array<any>, s: Array<any>) => {
    const asset = s[0]
    const balance = s[1]

    // handle zero balance
    if (balance < 1) { return a }

    var pct = balance / total * 100
    const coins = Math.round(reward * (pct / 100))

    return [...a, { [asset]: Number(coins) }]
  }, [], Object.entries(balances)))

  // handle off by one errors :)
  var remainder = reward - sum(values(allocation))
  var iterator = keys(allocation).entries()
  while (remainder > 0) {
    allocation[iterator.next().value[1]]++
    remainder--
  }

  return allocation
}

export function divideQty(n) {
  if (n < 1) {
    return [0, 0]
  }
  return [Math.floor(n * 0.8), Math.floor(n * 0.2)]
}