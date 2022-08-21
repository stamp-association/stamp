import fs from 'fs'
import { WarpFactory } from './warp/lib/cjs/index.js'

//const { WarpFactory } = await import('warp-contracts/lib/cjs/index.js')
const walletFile = process.argv.slice(2)[0]
const wallet = JSON.parse(fs.readFileSync(walletFile, 'utf-8'))

const CONTRACT = 'aSMILD7cEJr93i7TAVzzMjtci_sGkXcWnqpDkG6UGcA'
const warp = WarpFactory.forMainnet()
const contract = warp.contract(CONTRACT).connect(wallet).setEvaluationOptions({
  allowUnsafeClient: true,
  allowBigInt: true
})

const result = await contract.writeInteraction({
  function: 'reward',
  timestamp: Date.now()
})

console.log('result', result)

// const result2 = await contract.setEvaluationOptions({
//   allowUnsafeClient: true,
//   allowBigInt: true
// }).readState()

// console.log(JSON.stringify(result2, null, 2))