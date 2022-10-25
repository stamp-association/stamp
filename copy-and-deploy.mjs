import { WarpFactory, LoggerFactory } from 'warp-contracts/mjs'
import fs from 'fs'
import { path } from 'ramda'

LoggerFactory.INST.logLevel('error')

const walletFile = process.argv.slice(2)[0]
const wallet = JSON.parse(fs.readFileSync(walletFile, 'utf-8'))
const src = fs.readFileSync('./dist/contract.js', 'utf-8')

const creator = '4ALXfd76F129U8OCv0YUzTSuBTivUeqAVqnLD-sUk4c'
// need to get state from cache and merge with this state
// const oldState = await fetch('https://cache.permapages.app/aSMILD7cEJr93i7TAVzzMjtci_sGkXcWnqpDkG6UGcA')
//   .then(res => res.json())
const oldState = warp.contract('jAE_V6oXkb0dohIOjReMhrTlgLW0X2j3rxIZ5zgbjXw')
  .connect(wallet)
  .setEvaluationOptions({
    internalWrites: true,
    allowBigInt: true,
    allowUnsafeClient: true
  })
  .readState()
  .then(path(['cachedValue', 'state']))

const newState = Object.assign({}, oldState, {
  ticker: 'STAMP-TEST-v12', // 'STAMP-TEST-v10'
  creator,
  emergencyHaltWallet: creator,
  halted: false,
  canEvolve: true,
  pairs: []
})
// cancel orders from old pair
newState.balances['6Z-ifqgVi1jOwMvSNwKWs6ewUEQ0gU9eo4aHYC3rN1M'] += 596000000000000
newState.balances['vLRHFqCw1uHu75xqB4fCDW-QxpkpJxBtFD9g4QYUbfw'] += 1000000000000000

const warp = WarpFactory.forMainnet()
const result = await warp.createContract.deploy({
  wallet,
  initState: JSON.stringify(newState),
  src
})
console.log(result)
