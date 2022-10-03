import { test } from 'uvu'
import * as assert from 'uvu/assert'
import Arweave from 'arweave'
import ArLocal from 'arlocal'
import { assoc } from 'ramda'
import fs from 'fs'
import { WarpNodeFactory, LoggerFactory } from 'warp1' // inorder for this to work you need to edit package json and change imports to lib/cjs

LoggerFactory.INST.logLevel('fatal')

let stampWallet = {}
let userWallet = {}
let stampContract = ''
let assetContract = ''
let barContract = ''

test('evolve stampcoin', async () => {
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

  await setup(arweave)
  await doStamp(arweave, warp)
  await doRewards(arweave, warp)

  await doEvolve(arweave, warp)
  await new Promise(resolve => setTimeout(resolve, 500))

  await doStamp(arweave, warp)
  await doRewards(arweave, warp)
  //await readState(warp)

  await deployBarContract(arweave, warp)

  await readState(warp)

  await sellStampCoin(arweave, warp)


  await buyStampCoin(arweave, warp)

  const stampState = await readState(warp)

  assert.equal(stampState.balances[stampWallet.addr], 1999999999995000)
  assert.equal(stampState.balances[userWallet.addr], 2000000000000010)

  assert.ok(true)

  await doStamp(arweave, warp)
  await doRewards(arweave, warp)
  console.log(await readState(warp))


  await arlocal.stop()
})

test.run()

async function buyStampCoin(arweave, warp) {
  const bar = warp
    .contract(barContract)
    .connect(userWallet.jwk)
    .setEvaluationOptions({
      internalWrites: true,
      allowBigInt: true,
      allowUnsafeClient: true
    });

  const stamp = warp
    .contract(stampContract)
    .connect(userWallet.jwk)
    .setEvaluationOptions({
      internalWrites: true,
      allowBigInt: true,
      allowUnsafeClient: true
    });

  const result = await bar.writeInteraction({
    function: "allow",
    target: stampContract,
    qty: 10000,
  });

  await arweave.api.get('mine')
  await new Promise((resolve) => setTimeout(resolve, 500));

  const result2 = await stamp.writeInteraction({
    function: "createOrder",
    pair: [barContract, stampContract],
    qty: 10000,
    transaction: result,
  });

  await arweave.api.get('mine')
  const barState = (await bar.readState()).state
  //console.log(JSON.stringify(barState, null, 2))
  assert.equal(barState.balances[userWallet.addr], 990000)
  assert.equal(barState.balances[stampWallet.addr], 1009800)

}

async function sellStampCoin(arweave, warp) {
  const contract = warp
    .contract(stampContract)
    .connect(stampWallet.jwk)
    .setEvaluationOptions({
      internalWrites: true,
      allowBigInt: true,
      allowUnsafeClient: true
    });

  const result = await contract.writeInteraction({
    function: "addPair",
    pair: barContract,
  });

  await arweave.api.get('mine')
  await new Promise((resolve) => setTimeout(resolve, 500));

  const contractResult = await contract.writeInteraction({
    function: "createOrder",
    qty: 5000,
    pair: [stampContract, barContract],
    price: 1000,
  });
  await arweave.api.get('mine')
  await new Promise((resolve) => setTimeout(resolve, 500));

}

async function deployBarContract(arweave, warp) {
  const src = fs.readFileSync('./evolve-tests/contracts/bar.js', 'utf-8')
  const srctx = await arweave.createTransaction({ data: src });
  srctx.addTag("App-Name", "SmartWeaveContractSource");
  srctx.addTag("App-Version", "0.3.0");
  srctx.addTag("Content-Type", "application/javascript");
  await arweave.transactions.sign(srctx, userWallet.jwk);
  await arweave.transactions.post(srctx);

  // deploy contract
  const tx = await arweave.createTransaction({
    data: JSON.stringify({
      balances: {
        [userWallet.addr]: 1000000,
        [stampWallet.addr]: 1000000,
      },
      canEvolve: true,
      claimable: [],
      claims: [],
      creator: userWallet.addr,
      divisibility: 6,
      name: "BAR",
      settings: [["isTradeable", true]],
      ticker: "BAR",
    }),
  });
  tx.addTag("App-Name", "SmartWeaveContract");
  tx.addTag("Content-Type", "application/json");
  tx.addTag("Contract-Src", srctx.id);

  await arweave.transactions.sign(tx, userWallet.jwk);
  await arweave.transactions.post(tx);
  await arweave.api.get('mine')
  barContract = tx.id;
}

async function readState(warp) {
  const stateResult = await warp.contract(stampContract)
    .setEvaluationOptions({
      internalWrites: true,
      allowBigInt: true,
      allowUnsafeClient: true
    })
    .readState()
  return stateResult.state
}

async function doEvolve(arweave, warp) {
  const src = fs.readFileSync('./evolve-tests/contracts/stampcoin2.js', 'utf-8')
  const contract = await warp.contract(stampContract)
    .connect(stampWallet.jwk)

  const result1 = await contract.save({ src, useBundler: false })


  await arweave.api.get('mine')
  await new Promise(resolve => setTimeout(resolve, 500))

  const result2 = await contract.evolve(result1)
  await arweave.api.get('mine')

  const stateResult = await warp.contract(stampContract)
    .setEvaluationOptions({
      internalWrites: true,
      allowBigInt: true,
      allowUnsafeClient: true
    })
    .readState()
  assert.equal(stateResult.state.evolve, result1)
}

async function doRewards(arweave, warp) {
  await warp.contract(stampContract)
    .connect(stampWallet.jwk)
    .setEvaluationOptions({
      internalWrites: true,
      allowBigInt: true,
      allowUnsafeClient: true
    })
    .writeInteraction({
      function: 'reward',
      timestamp: Date.now()
    })

  await arweave.api.get('mine')
  await new Promise(resolve => setTimeout(resolve, 500))
  const stateResult = await warp.contract(stampContract)
    .setEvaluationOptions({
      internalWrites: true,
      allowBigInt: true,
      allowUnsafeClient: true
    })
    .readState()
  assert.ok(stateResult.state.stamps[`${userWallet.addr}:${assetContract}`].flagged)
}

async function doStamp(arweave, warp) {
  // need to create a tradeable atomic asset
  const src = fs.readFileSync('./evolve-tests/contracts/asset-src.js', 'utf-8')
  const { contractTxId } = await warp.createContract.deploy({
    src,
    wallet: userWallet.jwk,
    initState: JSON.stringify({
      balances: {
        [userWallet.addr]: 10000
      },
      claimable: [],
      claims: [],
      contentType: "text/pain",
      createdAt: 1664246537912,
      emergencyHaltWallet: userWallet.addr,
      foreignCalls: [],
      halted: false,
      invocations: [],
      name: "Permapage",
      owner: userWallet.addr,
      pairs: [],
      settings: [],
      ticker: "PAGE",
      title: "Hello, world",
      usedTransfers: []
    }),
    data: { 'Content-Type': 'text/plain', body: 'Hello World' }
  })
  assetContract = contractTxId

  // need to stamp it by calling STAMP Contract
  const result = await warp.contract(stampContract)
    .connect(userWallet.jwk)
    .setEvaluationOptions({
      internalWrites: true,
      allowBigInt: true,
      allowUnsafeClient: true
    })
    // .dryWrite({
    //   function: 'stamp',
    //   transactionId: assetContract,
    //   timestamp: Date.now()
    // })
    .writeInteraction({
      function: 'stamp',
      transactionId: assetContract,
      timestamp: Date.now()
    })
  await arweave.api.get('mine')
  await new Promise(resolve => setTimeout(resolve, 500))
  const stateResult = await warp.contract(stampContract)
    .setEvaluationOptions({
      internalWrites: true,
      allowBigInt: true,
      allowUnsafeClient: true
    })
    .readState()

  assert.ok(!stateResult.state.stamps[`${userWallet.addr}:${assetContract}`].flagged)

}

async function setup(arweave) {
  // create wallet for stamp owner
  stampWallet = { jwk: await arweave.wallets.generate() }
  stampWallet = assoc('addr', await arweave.wallets.jwkToAddress(stampWallet.jwk), stampWallet)
  await arweave.api.get(`mint/${stampWallet.addr}/${arweave.ar.arToWinston('1000')}`)
  await arweave.api.get('mine')

  // create wallet for stamp user
  userWallet = { jwk: await arweave.wallets.generate() }
  userWallet = assoc('addr', await arweave.wallets.jwkToAddress(userWallet.jwk), userWallet)
  await arweave.api.get(`mint/${userWallet.addr}/${arweave.ar.arToWinston('1000')}`)
  await arweave.api.get('mine')


  // deploy original STAMPCoin Contract
  const src = fs.readFileSync('./evolve-tests/contracts/stampcoin.js', 'utf-8')
  const initState = JSON.parse(fs.readFileSync('./evolve-tests/contracts/initial-state.json', 'utf-8'))
  initState.creator = stampWallet.addr
  initState.emergencyHaltWallet = stampWallet.addr
  initState.balances = { [stampWallet.addr]: 2000000000000000 }

  // deploy STAMPCOIN Source
  const srctx = await arweave.createTransaction({ data: src })
  srctx.addTag("App-Name", "SmartWeaveContractSource");
  srctx.addTag("App-Version", "0.3.0");
  srctx.addTag("Content-Type", "application/javascript");
  await arweave.transactions.sign(srctx, stampWallet.jwk);
  await arweave.transactions.post(srctx);

  // deploy STAMPCOIN
  const tx = await arweave.createTransaction({
    data: JSON.stringify(initState)
  })
  tx.addTag("App-Name", "SmartWeaveContract");
  tx.addTag("Content-Type", "application/json");
  tx.addTag("Contract-Src", srctx.id);

  await arweave.transactions.sign(tx, stampWallet.jwk);
  await arweave.transactions.post(tx);
  stampContract = tx.id;

}