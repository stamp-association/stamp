import { WarpFactory, LoggerFactory } from 'warp-contracts/mjs'
import fs from 'fs'

LoggerFactory.INST.logLevel('error')

const walletFile = process.argv.slice(2)[0]
const wallet = JSON.parse(fs.readFileSync(walletFile, 'utf-8'))

const CONTRACT = 'jAE_V6oXkb0dohIOjReMhrTlgLW0X2j3rxIZ5zgbjXw'
const warp = WarpFactory.forMainnet()
const contract = warp.contract(CONTRACT).connect(wallet).setEvaluationOptions({
  internalWrites: true,
  allowUnsafeClient: true,
  allowBigInt: true
})

const result = await contract.writeInteraction({
  function: 'reward',
  timestamp: Date.now()
})

console.log('result', result)
