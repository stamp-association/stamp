import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { WarpFactory } from 'warp-contracts/mjs'

import Stamps from '../src/index.js'

const warp = WarpFactory.forMainnet()

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

test.run()