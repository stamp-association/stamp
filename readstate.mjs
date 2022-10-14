import { WarpNodeFactory } from 'warp1'
import Arweave from 'arweave'
import fs from 'fs'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})
const walletFile = process.argv.slice(2)[0]
const wallet = JSON.parse(fs.readFileSync(walletFile, 'utf-8'))

const CONTRACT = 'mMffEC07TyoAFAI_O6q_nskj2bT8n4UFvckQ3yELeic'
//const CONTRACT = 'aSMILD7cEJr93i7TAVzzMjtci_sGkXcWnqpDkG6UGcA'
//const warp = WarpFactory.forMainnet()
const warp = WarpNodeFactory.memCached(arweave)
const contract = warp.contract(CONTRACT).connect(wallet).setEvaluationOptions({
  internalWrites: true,
  allowUnsafeClient: true,
  allowBigInt: true
})

const result = await contract.readState()

console.log('result', result)
console.log(result.state.balances['vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI'])