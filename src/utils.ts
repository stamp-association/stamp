import filter from 'ramda/src/filter'
import propEq from 'ramda/src/propEq'
import length from 'ramda/src/length'
import reduce from 'ramda/src/reduce'
import head from 'ramda/src/head'
import values from 'ramda/src/values'
import keys from 'ramda/src/keys'
import add from 'ramda/src/add'

import {
  StampInterface,
} from "./faces";

export function rewardAllocation(stamps: Array<StampInterface>, reward: number) {
  return reduce((a: Array<Record<string, number>>, s: StampInterface) => {
    const total = length(stamps)
    const balance = length(filter(propEq('asset', s.asset)), stamps)
    const pct = Math.round(balance / total * 100)
    const coins = Math.round(reward * (pct / 100))
    return [...a, { [s.asset]: coins }]
  }, [], stamps)
}

export function pstAllocation(balances: Array<Record<string, number>>, reward: number) {
  const total = reduce(add, 0, values(balances))
  return reduce((a: Array<Record<string, number>>, s: Record<string, number>) => {
    const balance = head(values(s))
    if (balance < 1) { return a }

    const asset = head(keys(s))
    const pct = Math.round(balance / total * 100)
    const coins = Math.round(reward * (pct / 100))
    return [...a, { [asset]: coins }]
  }, [], balances)
}