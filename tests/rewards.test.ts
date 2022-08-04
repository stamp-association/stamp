import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { mintRewards } from '../src/utils'

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

test('run rewards', () => {
  const result = mintRewards(stamps, 1000_000_000_000_000)
  console.log(result)
  assert.equal(true, true)
})