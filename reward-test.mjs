import fs from 'fs'
import { WarpFactory } from './warp/lib/cjs/index.js'

//const { WarpFactory } = await import('warp-contracts/lib/cjs/index.js')
const walletFile = process.argv.slice(2)[0]
const wallet = JSON.parse(fs.readFileSync(walletFile, 'utf-8'))

const CONTRACT = 'bOpSpTXBtxSaqmiNPKYs_A3cejfUC0ywlUJi4imW6EI'
const warp = WarpFactory.forMainnet()
const contract = warp.contract(CONTRACT).connect(wallet).setEvaluationOptions({
  allowUnsafeClient: true,
  allowBigInt: true
})

const result = await contract.writeInteraction({
  function: 'reward'
})

console.log('result', result)

// const result2 = await contract.setEvaluationOptions({
//   allowUnsafeClient: true,
//   allowBigInt: true
// }).readState()

// console.log(JSON.stringify(result2, null, 2))