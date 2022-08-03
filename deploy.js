// deploy contract to warp
import Arweave from 'arweave'
import { WarpNodeFactory, LoggerFactory } from 'warp-contracts'
import fs from 'fs'

const walletFile = process.argv.slice(2)[0]
const wallet = JSON.parse(fs.readFileSync(walletFile, 'utf-8'))
const src = fs.readFileSync('./dist/contract.js', 'utf-8')
const creator = '4ALXfd76F129U8OCv0YUzTSuBTivUeqAVqnLD-sUk4c'
const initalState = JSON.stringify({
  ticker: 'STAMP-TEST',
  creator,
  balances: {
    [creator]: 10_000_000_000_000
  },
  invocations: [],
  emergencyHaltWallet: creator,
  halted: false,
  pairs: [],
  usedTransfers: [],
  foreignCalls: [],
  stamps: {}
})

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

const warp = WarpNodeFactory.memCached(arweave)

await warp.createContract.deploy({
  initState: initialState,
  src,
  wallet
})
