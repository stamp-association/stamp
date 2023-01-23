// deploy contract to warp
import Arweave from 'arweave'
import { WarpFactory, LoggerFactory } from 'warp-contracts'
import fs from 'fs'

const walletFile = process.argv.slice(2)[0]
const wallet = JSON.parse(fs.readFileSync(walletFile, 'utf-8'))
const src = fs.readFileSync('./dist/contract.js', 'utf-8')
const creator = 'gpjgoaeJ_GhAZXeyGYY2hKhsoIay4elLJt1EOjSA1kY'
//const creator = '4ALXfd76F129U8OCv0YUzTSuBTivUeqAVqnLD-sUk4c'
const initState = JSON.stringify({
  ticker: 'STAMP-v13',
  creator,
  balances: {},
  invocations: [],
  emergencyHaltWallet: creator,
  halted: false,
  pairs: [],
  usedTransfers: [],
  foreignCalls: [],
  stamps: {},
  canEvolve: true
})

LoggerFactory.INST.logLevel('error')
const warp = WarpFactory.forMainnet()

const result = await warp.createContract.deploy({
  initState,
  src,
  wallet
}, true)

console.log(result)