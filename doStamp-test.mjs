import Arweave from 'arweave'
import { WarpFactory } from './warp/lib/cjs/index.js'
import fs from 'fs'

const wallet = JSON.parse(fs.readFileSync('./wallet.json', 'utf-8'))

const warp = WarpFactory.forTestnet()
//const contractId = 'WVurVaTcK0oVXr1o-iv-2LvFBjObFVsO9SeHxSx8KrA'
const contractId = 'YHEEic4SXiS4iUtMnKedH8b2TwZdj_q4tBuPI-kMFMo'

// const result = await warp.pst(contractId)
//   .setEvaluationOptions({
//     allowUnsafeClient: true
//   })
//   .readState()

// console.log(result)

// STAMP Contract!
// const id = await warp.contract(contractId)
//   .connect(wallet)
//   .writeInteraction({
//     function: 'stamp',
//     transactionId: contractId,
//     timestamp: Date.now()
//   })

// console.log(id)

const result = await warp.contract(contractId)
  .setEvaluationOptions({
    allowUnsafeClient: true,
    allowBigInt: true
  })
  .readState()

console.log(result)


