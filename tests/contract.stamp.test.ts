import { test } from 'uvu'
import * as assert from 'uvu/assert'
import ArLocal from 'arlocal'
import Arweave from 'arweave'
import { WarpNodeFactory } from 'warp-contracts'

import * as fs from 'fs'

const src = fs.readFileSync('./dist/contract.js', 'utf-8')

test('stamp a contract', async () => {
  const arlocal = new ArLocal()
  await arlocal.start()

  const arweave = Arweave.init({
    host: 'localhost',
    port: 1984,
    protocol: 'http'
  })

  const wallet = await arweave.wallets.generate()
  const creator = await arweave.wallets.jwkToAddress(wallet)
  await arweave.api.get(`mint/${creator}/${arweave.ar.arToWinston('1000')}`)
  const warp = WarpNodeFactory.forTesting(arweave)

  const initalState = JSON.stringify({
    ticker: 'STAMPCOIN-TEST',
    creator,
    balances: {},
    invocations: [],
    emergencyHaltWallet: creator,
    halted: false,
    pairs: [],
    usedTransfers: [],
    foreignCalls: [],
    stamps: {},
    canEvolve: true
  })

  const result = await warp.createContract.deploy({
    src,
    initState: initalState,
    wallet
  })

  await arweave.api.get('mine')

  const tx = await arweave.createTransaction({ data: 'Hello World' })
  tx.addTag('Vouch-For', creator)
  await arweave.transactions.sign(tx, wallet)
  await arweave.transactions.post(tx)

  await arweave.api.get('mine')

  // stamp tx
  const r2 = await warp.contract(result.contractTxId).connect(wallet).writeInteraction({
    function: 'stamp',
    transactionId: result.contractTxId
  })
  console.log(r2)
  await arweave.api.get('mine')

  const r3 = await warp.contract(result.contractTxId).setEvaluationOptions({
    allowUnsafeClient: true
  }).readState()
  console.log(r3)
  //await arlocal.stop()
})

test.run()
