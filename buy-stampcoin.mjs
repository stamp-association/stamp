import Arweave from 'arweave'
import { assoc } from 'ramda'
import fetch from 'node-fetch'
import fs from 'fs'
import { WarpNodeFactory, LoggerFactory } from 'warp1' // inorder for this to work you need to edit package json and change imports to lib/cjs

const wallet = JSON.parse(fs.readFileSync('./wallet.json', 'utf-8'))
const BAR = 'mMffEC07TyoAFAI_O6q_nskj2bT8n4UFvckQ3yELeic'
const STAMP = 'aSMILD7cEJr93i7TAVzzMjtci_sGkXcWnqpDkG6UGcA'


async function main() {
  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
  })
  const warp = WarpNodeFactory.memCached(arweave)

  await buyStampCoin(warp)
}

main()

async function buyStampCoin(warp) {
  // allow or stage some tokens for purchase
  const txId = await warp.contract(BAR).connect(wallet).setEvaluationOptions({
    allowUnsafeClient: true,
    allowBigInt: true,
    internalWrites: true
  }).bundleInteraction({
    function: 'allow',
    target: STAMP,
    qty: 2_000_000
  })

  await new Promise(resolve => setTimeout(resolve, 500))

  await warp.contract(STAMP).connect(wallet).setEvaluationOptions({
    allowUnsafeClient: true,
    allowBigInt: true,
    internalWrites: true
  }).bundleInteraction({
    function: 'createOrder',
    pair: [BAR, STAMP],
    price: 100_000_000_000_000,
    transaction: txId,
    qty: 2_000_000
  })

  fetch(`https://cache.permapages.app/${STAMP}`)
    .then(res => res.json())
    .then((state) => console.log(JSON.stringify(state, null, 2)))

  fetch(`https://cache.permapages.app/${BAR}`)
    .then(res => res.json())
    .then((state) => console.log(JSON.stringify(state, null, 2)))

}

