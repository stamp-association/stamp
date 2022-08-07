// deploy contract to warp
import Arweave from 'arweave'
import { WarpNodeFactory, LoggerFactory } from 'warp-contracts'
import fs from 'fs'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
})

LoggerFactory.INST.logLevel('error')
const warp = WarpNodeFactory.memCached(arweave)

const walletFile = process.argv.slice(2)[0]
const wallet = JSON.parse(fs.readFileSync(walletFile, 'utf-8'))
const src = fs.readFileSync('./dist/contract.js', 'utf-8')
//const creator = '4ALXfd76F129U8OCv0YUzTSuBTivUeqAVqnLD-sUk4c'
const contract = 'QeysEgSYPoyq_87pkpboRG1zznPUlx-O-J72ObvS5Ho' // STAMPCOIN-TEST-v0.3
const pst = warp.pst(contract).connect(wallet)

const srcTxId = await pst.save({ src })
console.log('new Source', srcTxId)

const evolveResult = await pst.evolve(srcTxId)

console.log('evolveResult: ', evolveResult)

