import { test } from 'uvu'
import * as assert from 'uvu/assert'
import Arweave from 'arweave'
import ArLocal from 'arlocal'
import { assoc } from 'ramda'
import fs from 'fs'
import { WarpNodeFactory, LoggerFactory } from 'warp1' // inorder for this to work you need to edit package json and change imports to lib/cjs

const ONE_BAR = 1_000_000
const ONE_STAMP = 1_000_000_000_000


LoggerFactory.INST.logLevel('fatal')

let buyerWallet = {}
let sellerWallet = {}
let stampContract = ''
let barContract = ''

test('exchange stampcoin', async () => {
  // start arlocal
  const arlocal = new ArLocal.default(1984, false)
  await arlocal.start()

  const arweave = Arweave.init({
    host: 'localhost',
    port: 1984,
    protocol: 'http'
  })

  const warp = WarpNodeFactory.memCachedBased(arweave)
    .useArweaveGateway()
    .build()

  await setup(arweave, warp)

  await sellStampCoin(arweave, warp)

  const txId = await allow(arweave, warp)

  await buyStampCoin(txId, arweave, warp)

  assert.ok(true)

  await arlocal.stop()
})

async function allow(arweave, warp) {
  // allow or stage some tokens for purchase
  const txId = await warp.contract(barContract).connect(buyerWallet.jwk).setEvaluationOptions({
    allowUnsafeClient: true,
    allowBigInt: true,
    internalWrites: true
  }).writeInteraction({
    function: 'allow',
    target: stampContract,
    qty: ONE_BAR
  })
  await arweave.api.get('mine')
  await warp.contract(barContract).setEvaluationOptions({
    allowUnsafeClient: true,
    allowBigInt: true,
    internalWrites: true
  }).readState().then(({ state }) => console.log(JSON.stringify(state, null, 2)))

  return txId

}

async function sellStampCoin(arweave, warp) {
  await warp.contract(stampContract).connect(sellerWallet.jwk).setEvaluationOptions({
    allowUnsafeClient: true,
    allowBigInt: true,
    internalWrites: true
  }).writeInteraction({
    function: 'createOrder',
    pair: [stampContract, barContract],
    qty: 100 * ONE_STAMP,
    price: ONE_BAR / (100 * ONE_STAMP) // 1 BAR / 100 STAMPS
    //price: 0.0000001 // 1 BAR / 10 STAMPS
    // ONE_STAMP price: 0.00000001
  })
  await arweave.api.get('mine')

  await warp.contract(stampContract).setEvaluationOptions({
    allowUnsafeClient: true,
    allowBigInt: true,
    internalWrites: true
  }).readState().then(({ state }) => console.log(JSON.stringify(state, null, 2)))


  return await warp.contract(barContract).setEvaluationOptions({
    allowUnsafeClient: true,
    allowBigInt: true,
    internalWrites: true
  }).readState().then(({ state }) => console.log(JSON.stringify(state, null, 2)))
}

async function buyStampCoin(txId, arweave, warp) {

  // purchase some stamp coin
  await warp.contract(stampContract).connect(buyerWallet.jwk).setEvaluationOptions({
    allowUnsafeClient: true,
    allowBigInt: true,
    internalWrites: true
  }).writeInteraction({
    function: 'createOrder',
    pair: [barContract, stampContract],
    transaction: txId,
    qty: ONE_BAR
  })
  await arweave.api.get('mine')

  const { state } = await warp.contract(stampContract).setEvaluationOptions({
    allowUnsafeClient: true,
    allowBigInt: true,
    internalWrites: true
  }).readState()
  console.log(JSON.stringify(state, null, 2))

  warp.contract(barContract).setEvaluationOptions({
    allowUnsafeClient: true,
    allowBigInt: true,
    internalWrites: true
  }).readState().then(({ state }) => console.log(JSON.stringify(state, null, 2)))
}

async function setup(arweave, warp) {
  buyerWallet = { jwk: await arweave.wallets.generate() }
  buyerWallet = assoc('addr', await arweave.wallets.jwkToAddress(buyerWallet.jwk), buyerWallet)
  await arweave.api.get(`mint/${buyerWallet.addr}/${arweave.ar.arToWinston('10000')}`)
  await arweave.api.get('mine')

  sellerWallet = { jwk: await arweave.wallets.generate() }
  sellerWallet = assoc('addr', await arweave.wallets.jwkToAddress(sellerWallet.jwk), sellerWallet)
  await arweave.api.get(`mint/${sellerWallet.addr}/${arweave.ar.arToWinston('50000')}`)
  await arweave.api.get('mine')


  const src = fs.readFileSync('./exchange-tests/contracts/bar.js', 'utf-8')
  const result = await warp.createContract.deploy({
    src,
    wallet: sellerWallet.jwk,
    initState: JSON.stringify({
      balances: {
        [sellerWallet.addr]: 0,
        [buyerWallet.addr]: 5_000_000_000 * ONE_BAR,
      },
      canEvolve: true,
      claimable: [],
      claims: [],
      creator: sellerWallet.addr,
      divisibility: 6,
      name: "ARLOCAL-BAR",
      settings: [["isTradeable", true]],
      ticker: "BAR",
    })
  })
  barContract = result.contractTxId

  console.log(barContract)

  const result2 = await warp.createContract.deploy({
    src: fs.readFileSync('./exchange-tests/contracts/stampcoin2.js', 'utf-8'),
    wallet: sellerWallet.jwk,
    initState: JSON.stringify({
      "pairs": [],
      "halted": false,
      "stamps": {},
      "ticker": "DO_NOT_USE",
      "creator": sellerWallet.addr,
      "balances": {
        [buyerWallet.addr]: 0,
        [sellerWallet.addr]: 10000 * ONE_STAMP
      },
      "canEvolve": true,
      "invocations": [],
      "foreignCalls": [],
      "usedTransfers": [],
      "emergencyHaltWallet": sellerWallet.addr,
      divisibility: 12,
      "settings": [
        [
          "isTradeable",
          true
        ]
      ],
    })
  })
  stampContract = result2.contractTxId
  console.log(stampContract)

  await arweave.api.get('mine')

  await warp.contract(stampContract).connect(sellerWallet.jwk).setEvaluationOptions({
    allowUnsafeClient: true,
    allowBigInt: true,
    internalWrites: true
  })
    .writeInteraction({
      function: 'addPair',
      pair: barContract
    })

  await arweave.api.get('mine')

  // const { state } = await warp.contract(stampContract).setEvaluationOptions({
  //   allowUnsafeClient: true,
  //   allowBigInt: true,
  //   internalWrites: true
  // }).readState()
  // console.log(state)

}

test.run()