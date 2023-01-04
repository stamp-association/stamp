import crypto from 'crypto'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { handle } from '../src/contract.ts'
import { take } from 'ramda'

globalThis.ContractAssert = (exp, txt) => {
  if (exp) {
    null
  } else {
    throw new Error(txt)
  }
}

globalThis.ContractError = Error

globalThis.SmartWeave = {
  block: {
    height: 10000000000
  },
  contracts: {
    readContractState: (c) => {
      if (c === '_z0ch80z_daDUFqC9jHjfOL8nekJcok4ZRkE_UesYsk') {
        return Promise.resolve({ vouched: { '0gf7KpDmLMfCq8oqVeQqqJChzRnx0ZOtWsvHfVYKACo': [{ service: 'foobar', transaction: 'beep' }] } })
      } else if (c === 'wy-axWrIVPr8nIKY38VYQdeAY5QpvK_Vv8vwtrXuxek') {
        return Promise.resolve({
          balances: {
            'vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI': 1000000000,
            'K92n-x2kHiRIBmS0yRGz5ii3OEXFw58__742Qu0DTgA': 10000000
          }
        })

      }
    }
  }
}

test('stamp a contract', async () => {
  const ts = Date.now()
  const { state } = await handle({ balances: {}, stamps: {} }, {
    input: {
      function: 'stamp',
      transactionId: 'wy-axWrIVPr8nIKY38VYQdeAY5QpvK_Vv8vwtrXuxek',
      timestamp: ts
    },
    caller: '0gf7KpDmLMfCq8oqVeQqqJChzRnx0ZOtWsvHfVYKACo'
  })

  assert.equal(state.stamps['0gf7KpDmLMfCq8oqVeQqqJChzRnx0ZOtWsvHfVYKACo:wy-axWrIVPr8nIKY38VYQdeAY5QpvK_Vv8vwtrXuxek'], {
    timestamp: ts,
    asset: 'wy-axWrIVPr8nIKY38VYQdeAY5QpvK_Vv8vwtrXuxek',
    address: '0gf7KpDmLMfCq8oqVeQqqJChzRnx0ZOtWsvHfVYKACo',
    flagged: false
  })
  assert.ok(true)
})

test('super stamp a contract', async () => {
  const ts = Date.now()
  const { state } = await handle({ balances: { '0gf7KpDmLMfCq8oqVeQqqJChzRnx0ZOtWsvHfVYKACo': 1000 * 1e12 }, stamps: {} }, {
    input: {
      function: 'stamp',
      transactionId: 'wy-axWrIVPr8nIKY38VYQdeAY5QpvK_Vv8vwtrXuxek',
      timestamp: ts,
      qty: 500 * 1e12
    },
    caller: '0gf7KpDmLMfCq8oqVeQqqJChzRnx0ZOtWsvHfVYKACo'
  })

  assert.equal(state.stamps['0gf7KpDmLMfCq8oqVeQqqJChzRnx0ZOtWsvHfVYKACo:wy-axWrIVPr8nIKY38VYQdeAY5QpvK_Vv8vwtrXuxek'], {
    timestamp: ts,
    asset: 'wy-axWrIVPr8nIKY38VYQdeAY5QpvK_Vv8vwtrXuxek',
    address: '0gf7KpDmLMfCq8oqVeQqqJChzRnx0ZOtWsvHfVYKACo',
    flagged: false
  })
  assert.ok(true)

  assert.equal(state.credits['10000262800'].length, 2)
})

test.run()
