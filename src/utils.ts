import filter from 'ramda/src/filter'
import propEq from 'ramda/src/propEq'
import length from 'ramda/src/length'
import reduce from 'ramda/src/reduce'

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
  }, [])
}