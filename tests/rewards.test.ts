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
  address: '2',
  timestamp: new Date(),
  flagged: false
}
  , {
  asset: 'C',
  address: '4',
  timestamp: new Date(),
  flagged: false
}, {
  asset: 'C',
  address: '5',
  timestamp: new Date(),
  flagged: false
}, {
  asset: 'C',
  address: '6',
  timestamp: new Date(),
  flagged: false
}, {
  asset: 'C',
  address: '8',
  timestamp: new Date(),
  flagged: false
}
  , {
  asset: 'A',
  address: '8',
  timestamp: new Date(),
  flagged: false
}
  , {
  asset: 'B',
  address: '8',
  timestamp: new Date(),
  flagged: false
}, {
  asset: 'D',
  address: '8',
  timestamp: new Date(),
  flagged: false
}, {
  asset: 'D',
  address: '1',
  timestamp: new Date(),
  flagged: false
}, {
  asset: 'D',
  address: '3',
  timestamp: new Date(),
  flagged: false
}
]

test('run rewards', () => {
  const mint = 1000_000_000_000_000
  const result = mintRewards(stamps, mint)
  assert.equal(Object.values(result).reduce((a, b) => a + b, 0), mint)
})