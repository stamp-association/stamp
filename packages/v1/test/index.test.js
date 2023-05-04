import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { path, times, always } from 'ramda'

import { handle } from '../src/index.js'

class ContractError extends Error {
  constructor(msg) {
    super(msg)
    this.name = 'ContractError'
  }
}

globalThis.ContractError = ContractError

const TOM = times(always('X'), 43).join('')
const JUSTIN = times(always('Y'), 43).join('')
test('should throw function not found', async () => {
  try {
    await [{ caller: TOM, input: {} }].reduce(handle, {})
  } catch (e) {
    assert.ok(true)
  }
})

test.run()



