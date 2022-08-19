// deploy contract to warp
import Arweave from 'arweave'
import fs from 'fs'
import { WarpFactory } from './warp/lib/cjs/index.js'

//const { WarpFactory } = await import('warp-contracts/lib/cjs/index.js')
const walletFile = process.argv.slice(2)[0]
const wallet = JSON.parse(fs.readFileSync(walletFile, 'utf-8'))
const src = fs.readFileSync('./dist/contract.js', 'utf-8')

const creator = '4ALXfd76F129U8OCv0YUzTSuBTivUeqAVqnLD-sUk4c'
// need to get state from cache and merge with this state
const oldState = await fetch('https://cache.permapages.app/9nDWI3eHrMQbrfs9j8_YPfLbYJmBodgn7cBCG8bii4o')
  .then(res => res.json())
const newState = Object.assign({}, oldState, {
  ticker: 'STAMP-DRYRUN', // 'STAMP-TEST-v10'
  creator,
  emergencyHaltWallet: creator,
  halted: false,
  canEvolve: true
})

const stampEntries = Object
  .entries(newState.stamps)
  .map(s => [s[0], Object.assign({}, s[1], { timestamp: Date.now() })])
  .reduce((a, x) => ({ ...a, [x[0]]: x[1] }), {})

newState.stamps = stampEntries

//console.log('newState', newState)

const warp = WarpFactory.forMainnet()
const result = await warp.createContract.deploy({
  wallet,
  initState: JSON.stringify(newState),
  src
})
console.log(result)
/*

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

LoggerFactory.INST.logLevel('error')
const warp = WarpNodeFactory.memCached(arweave)

const result = await warp.createContract.deploy({
  initState,
  src,
  wallet
}, true)

console.log(result)

*/