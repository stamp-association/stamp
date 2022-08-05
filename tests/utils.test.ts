import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { pstAllocation } from '../src/utils'

const balances = {
  '1': 1,
  '2': 1,
  '3': 4,
  '5': 10,
  '8': 0,
  '9': -1
}

const reward = 249999999999999

test('pstAllocation', () => {
  const result = pstAllocation(balances, reward)
  console.log(result)
  assert.equal(result['1'], 17500000000000)
  assert.equal(result['5'], 167499999999999)
  assert.equal(result['9'], undefined)
})

test.run()