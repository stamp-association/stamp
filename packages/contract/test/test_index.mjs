import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { WarpFactory, defaultCacheOptions, LoggerFactory } from 'warp-contracts/mjs'

const STAMP = 'QY54ApX4agQPjsi3214GanqpCO7RvWdBqLTAvkGEo8g'
LoggerFactory.INST.logLevel('fatal')
const warp = WarpFactory.forMainnet({ ...defaultCacheOptions, inMemory: true })

test('stamp contract', async () => {
  await warp.contract(STAMP).syncState('https://dre-1.warp.cc/contract', { validity: true })
  const res = await warp.contract(STAMP).setEvaluationOptions({
    internalWrites: true,
    allowBigInt: true
  }).viewState({
    function: 'originCount',
    subdomain: 'stamps'
  })

  //const result = await handle(state, action)
  assert.equal(res.result, 1)
})

test.run()