import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { pstAllocation } from '../src/utils'

test('pstAllocation 1/3', () => {
  const reward = 178571428571430
  const balances = {
    '1': 1,
    '2': 1,
    '3': 1
  }

  const result = pstAllocation(balances, reward)
  assert.equal(Object.values(result).reduce((a, b) => a + b, 0), reward)
})

test('pstAllocation 1', () => {
  const reward = 464285714285715
  const balances = {
    '1': 1
  }

  const result = pstAllocation(balances, reward)
  console.log('result', result)
  assert.equal(Object.values(result).reduce((a, b) => a + b, 0), reward)
})

test.run()