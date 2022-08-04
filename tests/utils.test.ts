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

const reward = 1000

test('pstAllocation', () => {
  const result = pstAllocation(balances, reward)
  assert.equal(result['1'], 70)
  assert.equal(result['5'], 670)
  assert.equal(result['9'], undefined)
})

test.run()