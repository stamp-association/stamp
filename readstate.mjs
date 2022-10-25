import { WarpFactory } from 'warp-contracts/mjs'
import fs from 'fs'
import { path } from 'ramda'

const walletFile = process.argv.slice(2)[0]
const wallet = JSON.parse(fs.readFileSync(walletFile, 'utf-8'))

const CONTRACT = 'jAE_V6oXkb0dohIOjReMhrTlgLW0X2j3rxIZ5zgbjXw'

const warp = WarpFactory.forMainnet()
const contract = warp.contract(CONTRACT).connect(wallet)
  .setEvaluationOptions({
    internalWrites: true,
    allowUnsafeClient: true,
    allowBigInt: true
  })

const result = await contract.readState().then(path(['cachedValue', 'state']))

console.log('result', result)
console.log(result.balances['vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI'])