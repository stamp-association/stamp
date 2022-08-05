import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { pstAllocation } from '../src/utils'

//const reward = 1000

test('pstAllocation 1/3', () => {
  const reward = 1000
  const balances = {
    '1': 1,
    '2': 1,
    '3': 1
  }

  const result = pstAllocation(balances, reward)
  console.log(result)
  assert.equal(Object.values(result).reduce((a, b) => a + b, 0), reward)
})

test('pstAllocation 1', () => {
  const reward = 1000
  const balances = {
    '1': 1
  }

  const result = pstAllocation(balances, reward)
  console.log(result)
  assert.equal(Object.values(result).reduce((a, b) => a + b, 0), reward)
})

/*
test('pstAllocation fractional', () => {
  const reward = 1000
  const balances = {
    '1': .6,
    '2': .4
  }

  const result = pstAllocation(balances, reward)
  console.log(result)
  assert.equal(Object.values(result).reduce((a, b) => a + b, 0), reward)
})
*/

test.run()