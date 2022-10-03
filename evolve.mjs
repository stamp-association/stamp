// deploy contract to warp
import Arweave from 'arweave'
import { WarpNodeFactory } from 'warp1'
import fs from 'fs'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

const warp = WarpNodeFactory.memCached(arweave)

const walletFile = process.argv.slice(2)[0]
const wallet = JSON.parse(fs.readFileSync(walletFile, 'utf-8'))
const src = fs.readFileSync('./dist/contract.js', 'utf-8')
//const creator = '4ALXfd76F129U8OCv0YUzTSuBTivUeqAVqnLD-sUk4c'
const CONTRACT = 'aSMILD7cEJr93i7TAVzzMjtci_sGkXcWnqpDkG6UGcA' // STAMPCOIN-TEST-v10
const contract = warp.contract(CONTRACT).connect(wallet)

const srcTxId = await contract.save({ src, useBundler: false })
console.log('new Source', srcTxId)

const evolveResult = await contract.evolve(srcTxId)

console.log('evolveResult: ', evolveResult)

