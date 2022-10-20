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
const oldState = await fetch('https://cache.permapages.app/aSMILD7cEJr93i7TAVzzMjtci_sGkXcWnqpDkG6UGcA')
  .then(res => res.json())
const newState = Object.assign({}, oldState, {
  ticker: 'STAMP-TEST-v11', // 'STAMP-TEST-v10'
  creator,
  emergencyHaltWallet: creator,
  halted: false,
  canEvolve: true
})

const warp = WarpFactory.forMainnet()
const result = await warp.createContract.deploy({
  wallet,
  initState: JSON.stringify(newState),
  src
})
console.log(result)
