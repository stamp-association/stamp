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

globalThis.SmartWeave = {
  contracts: {
    readContractState: () => Promise.resolve({ vouched: { '0gf7KpDmLMfCq8oqVeQqqJChzRnx0ZOtWsvHfVYKACo': { service: 'foobar', transaction: 'beep' } } })
  }
}

test('stamp a contract', async () => {
  const ts = Date.now()
  const { state } = await handle({ stamps: {} }, {
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

test.run()
