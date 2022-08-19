// deploy contract to warp
import Arweave from 'arweave'
import { WarpFactory } from './warp/lib/cjs/index.js'
import fs from 'fs'

const warp = WarpFactory.forMainnet()

const walletFile = process.argv.slice(2)[0]
const wallet = JSON.parse(fs.readFileSync(walletFile, 'utf-8'))
const src = fs.readFileSync('./dist/contract.js', 'utf-8')
//const creator = '4ALXfd76F129U8OCv0YUzTSuBTivUeqAVqnLD-sUk4c'
const CONTRACT = 'jKIvp5GBWhmMbHwuJD0ZiaiQhCn-RUGiCB8jLiykJjo' // STAMPCOIN-TEST-v0.3
const contract = warp.contract(CONTRACT).connect(wallet)

const srcTxId = await contract.save({ src, useBundler: false })
console.log('new Source', srcTxId)

const evolveResult = await contract.evolve(srcTxId)

console.log('evolveResult: ', evolveResult)

