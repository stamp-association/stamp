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
const oldState = await fetch(`https://cache.permapages.app/FMRHYgSijiUNBrFy-XqyNNXenHsCV0ThR4lGAPO4chA`)
  .then(res => res.json())
/*
.connect(wallet)
.setEvaluationOptions({
  internalWrites: true,
  allowBigInt: true,
  allowUnsafeClient: true
})
.readState()
.then(path(['cachedValue', 'state']))
*/
//console.log(JSON.stringify(oldState.pairs, null, 2))
const newState = Object.assign({}, oldState, {
  ticker: 'STAMP-TEST',
  name: 'Stamp Protocol Test Contract',
  version: 'test',
  creator,
  emergencyHaltWallet: creator,
  halted: false,
  canEvolve: true,
  evolve: null,
  pairs: [{
    "pair": [
      "FMRHYgSijiUNBrFy-XqyNNXenHsCV0ThR4lGAPO4chA",
      "VFr3Bk-uM-motpNNkkFg4lNW1BMmSfzqsVO551Ho4hA"
    ],
    "orders": [

    ]
  }]
})

// cancel orders and restore
newState.balances['SamNhE8JBi3R7Pn6ovDmxB7fB0CocDWj48p3-q6551w'] += 496875000000000
newState.balances['XOXxc-49xz_ElNmMed58mmEn-rn-yFEDYhEsDsPKAwg'] += 75000000000000
newState.balances['6Z-ifqgVi1jOwMvSNwKWs6ewUEQ0gU9eo4aHYC3rN1M'] += 50000000000000
newState.balances['ZEu7pmk5yKnR5TxeOhk6MNOLcaDB4PzB73FO94xRh3Y'] += 41250000000000

delete newState.stamps['TJm7pAxZyJNE8IhYgC1ZEF3RiRI3B5u38REQJU0uy8I:[object Object]']

console.log(JSON.stringify(newState, null, 2))

const warp = WarpFactory.forMainnet()
const result = await warp.createContract.deploy({
  wallet,
  initState: JSON.stringify(newState),
  src
})
console.log(result)
