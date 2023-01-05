import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { rewardCredits } from '../src/utils'

let state = {
  balances: {
    '8888888888': 1
  },
  credits: {
    '1000': [{
      holder: '8888888888',
      qty: 1 * 1e12,
      asset: ''
    }, {
      holder: '7777777777',
      qty: 5 * 1e12,
      asset: ''
    }, {
      holder: '8431234433',
      qty: 10 * 1e12,
      asset: '1234'
    }],
    '2000': [{
      holder: '8888888888',
      qty: 10 * 1e12,
      asset: ''
    }, {
      holder: '7777777777',
      qty: 1 * 1e12,
      asset: ''
    }, {
      holder: '8431234433',
      qty: 70 * 1e12,
      asset: '1234'
    }],
    '3000': [{
      holder: '8888888888',
      qty: 80 * 1e12,
      asset: ''
    }, {
      holder: '7777777777',
      qty: 50 * 1e12,
      asset: ''
    }, {
      holder: '8431234433',
      qty: 8 * 1e12,
      asset: '1234'
    }]
  }

}

test('reward credits', () => {
  const results = rewardCredits(state, '2100')
  console.log(JSON.stringify(results, null, 2))

})

test.run()
