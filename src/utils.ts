import filter from 'ramda/src/filter'
import propEq from 'ramda/src/propEq'
import length from 'ramda/src/length'
import reduce from 'ramda/src/reduce'
import assoc from 'ramda/src/assoc'
import values from 'ramda/src/values'
import keys from 'ramda/src/keys'
import add from 'ramda/src/add'
import mergeAll from 'ramda/src/mergeAll'

import {
  StampInterface,
} from "./faces";

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

    const pct = Math.round(balance / total * 100)
    const coins = Math.round(reward * (pct / 100))

    return [...a, { [asset]: coins }]
  }, [], Object.entries(balances)))
}