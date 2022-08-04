import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { pstAllocation, rewardAllocation } from '../src/utils'

const stamps = [{
  asset: 'A',
  address: '1',
  timestamp: new Date(),
  flagged: false
}, {
  asset: 'A',
  address: '2',
  timestamp: new Date(),
  flagged: false
}
  , {
  asset: 'B',
  address: '3',
  timestamp: new Date(),
  flagged: false
}
  , {
  asset: 'C',
  address: '4',
  timestamp: new Date(),
  flagged: false
}
]

test('rewardAllocation', () => {
  const result = rewardAllocation(stamps, 1000)
  assert.equal(result['A'], 500)
  assert.equal(result['B'], 250)
})


const balances = {
  '1': 1,
  '2': 1,
  '3': 4,
  '5': 10,
  '8': 0,
  '9': -1
}

const reward = 6.250000000000001e+58

test('pstAllocation', () => {
  const result = pstAllocation(balances, reward)
  console.log(result)
  assert.equal(result['1'], 4.375000000000001e+57)
  assert.equal(result['5'], 4.187500000000001e+58)
  assert.equal(result['9'], undefined)
})

test.run()