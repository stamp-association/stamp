import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { WarpFactory } from 'warp-contracts/mjs'
import Arweave from 'arweave'

import Stamps from '../src/index.js'

const arweave = Arweave.init({})
const warp = WarpFactory.forMainnet()

global.arweaveWallet = {
  sign: async (tx) => {
    const jwk = await arweave.wallets.generate()
    console.log(jwk)
    await arweave.transactions.sign(tx, jwk)
    return tx
  }
}

test('init stampjs', () => {
  const stamps = Stamps.init({ warp })
  assert.ok(stamps.stamp)
})

test('init stampjs - warp is required!', () => {
  try {
    const stamps = Stamps.init({})
    assert.ok(false)
  } catch (e) {
    assert.equal(e.message, 'warp instance is required for stampjs')
    assert.ok(true)
  }
})

test('stamp asset', async () => {
  const stamps = Stamps.init({ warp })
  const result = await stamps.stamp('oHB-hYNKHOSqWrxJjroXZatSEmmFYpdKpoGTXNqvSo8')
  console.log(result)
  assert.ok(true)
})

test.run()