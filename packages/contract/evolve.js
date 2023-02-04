// deploy contract to warp
import Arweave from 'arweave'
import { WarpFactory } from 'warp-contracts/mjs'
import fs from 'fs'

const warp = WarpFactory.forMainnet()

const walletFile = process.argv.slice(2)[0]
const wallet = JSON.parse(fs.readFileSync(walletFile, 'utf-8'))
const src = fs.readFileSync('./dist/index.js', 'utf-8')
const srcTx = await warp.createSourceTx({ src }, wallet)
const newSrcTxId = await warp.saveSourceTx(srcTx)

const CONTRACT = 'QY54ApX4agQPjsi3214GanqpCO7RvWdBqLTAvkGEo8g' // STAMP-TEST
const contract = warp.contract(CONTRACT).connect(wallet)

console.log('new Source', newSrcTxId)

const evolveResult = await contract.evolve(newSrcTxId)

console.log('evolveResult: ', evolveResult)

