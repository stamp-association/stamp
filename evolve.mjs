// deploy contract to warp
import Arweave from 'arweave'
import { WarpFactory } from 'warp-contracts'
import fs from 'fs'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

const warp = WarpFactory.forMainnet()

const walletFile = process.argv.slice(2)[0]
const wallet = JSON.parse(fs.readFileSync(walletFile, 'utf-8'))
const src = fs.readFileSync('./dist/contract.js', 'utf-8')
//const creator = '4ALXfd76F129U8OCv0YUzTSuBTivUeqAVqnLD-sUk4c'
const CONTRACT = 'FMRHYgSijiUNBrFy-XqyNNXenHsCV0ThR4lGAPO4chA' // STAMPCOIN-TEST-v12
const contract = warp.contract(CONTRACT).connect(wallet)

const srcTxId = await contract.save({ src, useBundler: false })
console.log('new Source', srcTxId)

const evolveResult = await contract.evolve(srcTxId)

console.log('evolveResult: ', evolveResult)

