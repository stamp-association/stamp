import Arweave from 'arweave'
import { WarpNodeFactory, LoggerFactory } from 'warp-contracts'
import fs from 'fs'

const wallet = JSON.parse(fs.readFileSync('./tom.json', 'utf-8'))

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

const addr = await arweave.wallets.jwkToAddress(wallet)
console.log('addr', addr)
LoggerFactory.INST.logLevel('debug')
const warp = WarpNodeFactory.memCached(arweave)
const contractId = 'WVurVaTcK0oVXr1o-iv-2LvFBjObFVsO9SeHxSx8KrA'

// const result = await warp.pst(contractId)
//   .setEvaluationOptions({
//     allowUnsafeClient: true
//   })
//   .readState()

// console.log(result)

// STAMP Contract!
// const id = await warp.pst(contractId)
//   .connect(wallet)
//   .bundleInteraction({
//     function: 'stamp',
//     transactionId: contractId
//   })

// console.log(id)

const result = await warp.pst(contractId)
  .setEvaluationOptions({
    allowUnsafeClient: true
  })
  .readState()

console.log(result)


