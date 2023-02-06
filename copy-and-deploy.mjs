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

//console.log(JSON.stringify(oldState.pairs, null, 2))
const newState = Object.assign({}, oldState, {
  ticker: 'STAMP',
  name: 'Stamp Protocol',
  version: 'v2.test',
  creator,
  emergencyHaltWallet: creator,
  halted: false,
  canEvolve: true,
  evolve: null,
  pairs: []
})

// cancel orders and restore
newState.balances['SamNhE8JBi3R7Pn6ovDmxB7fB0CocDWj48p3-q6551w'] += 496875000000000
newState.balances['XOXxc-49xz_ElNmMed58mmEn-rn-yFEDYhEsDsPKAwg'] += 75000000000000
newState.balances['6Z-ifqgVi1jOwMvSNwKWs6ewUEQ0gU9eo4aHYC3rN1M'] += 50000000000000
newState.balances['ZEu7pmk5yKnR5TxeOhk6MNOLcaDB4PzB73FO94xRh3Y'] += 41250000000000
newState.balances['XOXxc-49xz_ElNmMed58mmEn-rn-yFEDYhEsDsPKAwg'] += 50000000000000
newState.balances['6Z-ifqgVi1jOwMvSNwKWs6ewUEQ0gU9eo4aHYC3rN1M'] += 100000000000000

delete newState.stamps['TJm7pAxZyJNE8IhYgC1ZEF3RiRI3B5u38REQJU0uy8I:[object Object]']

Object.keys(newState.stamps).forEach(k => {
  newState.stamps[k].vouched = true
})


console.log(JSON.stringify(newState.stamps, null, 2))


const warp = WarpFactory.forMainnet()
const result = await warp.createContract.deployFromSourceTx({
  wallet,
  initState: JSON.stringify(newState),
  srcTxId: 'DmCOgEwtsJ8GBzZxetZb7ze414UrQCBESGZJHRtLbTA'
})
console.log(result)
