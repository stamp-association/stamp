import map from 'ramda/src/map'
import take from 'ramda/src/take'
import Stamps from '@permaweb/stampjs'
import { WarpFactory, LoggerFactory } from 'warp-contracts'
import Arweave from "arweave"

LoggerFactory.INST.logLevel('fatal')
const arweave = Arweave.init({})
const _stamps = Stamps.init({ warp: WarpFactory.forMainnet(), arweave })

export const hasStamped = (txId) => _stamps.hasStamped(txId)
export const stamp = (txId) => _stamps.stamp(txId)
export const getStampCount = async (txId) => await _stamps.count(txId)