import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { times, always } from 'ramda'

const createKey = c => times(always(c), 43).join('')


const CONTRACT = createKey('A')
const CONTRACT2 = createKey('B')
const TOM = createKey('X')
const JUSTIN = createKey('Y')


test('stamp as vouched user', async () => {
  class ContractError extends Error {
    constructor(msg) {
      super(msg)
      this.name = 'ContractError'
    }
  }

  globalThis.ContractError = ContractError

  globalThis.SmartWeave = {
    contracts: {
      readContractState: contractId => contractId === CONTRACT
        ? Promise.reject('Not Found')
        : Promise.resolve({
          vouched: {
            [TOM]: [{ service: 'Ax_uXyLQBPZSQ15movzv9-O1mDo30khslqN64qD27Z8' }],
            [JUSTIN]: [{ service: 'Ax_uXyLQBPZSQ15movzv9-O1mDo30khslqN64qD27Z8' }]
          }
        })
    },
    transaction: {
      id: createKey('z'),
      owner: JUSTIN,
      tags: [{ name: 'Data-Source', value: CONTRACT2 }]
    },
    block: {
      height: 10000000,
      timestamp: Date.now()
    }
  }

  const { handle } = await import('../src/index.js')
  const state = {
    balances: {},
    stamps: {},
    assets: {},
    vouchDAO: createKey('V'),
    lastReward: 1111000,
    pairs: []
  }

  const action = {
    caller: JUSTIN,
    input: {
      function: 'stamp'
    }
  }

  const result = await handle(state, action)
  assert.equal(result.state.stamps[CONTRACT2][0], JUSTIN)
  assert.ok(true)

  globalThis.SmartWeave = {}
})

test('additional stamp as vouched user', async () => {
  class ContractError extends Error {
    constructor(msg) {
      super(msg)
      this.name = 'ContractError'
    }
  }

  globalThis.ContractError = ContractError

  globalThis.SmartWeave = {
    contracts: {
      readContractState: contractId => contractId === CONTRACT
        ? Promise.reject('Not Found')
        : Promise.resolve({
          vouched: {
            [TOM]: true
          }
        })
    },
    transaction: {
      id: createKey('z'),
      owner: TOM,
      tags: [{ name: 'Data-Source', value: CONTRACT2 }]
    },
    block: {
      height: 10000000,
      timestamp: Date.now()
    }
  }

  const { handle } = await import('../src/index.js')
  const state = {
    balances: {},
    stamps: {
      [CONTRACT2]: [JUSTIN]
    },
    assets: {},
    vouchDAO: createKey('V'),
    lastReward: 1111000,
    pairs: []
  }

  const action = {
    caller: TOM,
    input: {
      function: 'stamp'
    }
  }

  const result = await handle(state, action)
  assert.equal(result.state.stamps[CONTRACT2][1], TOM)
  //assert.ok(true)

  globalThis.SmartWeave = {}
})

test('stamp as non vouched user', async () => {
  class ContractError extends Error {
    constructor(msg) {
      super(msg)
      this.name = 'ContractError'
    }
  }

  globalThis.ContractError = ContractError

  globalThis.SmartWeave = {
    contracts: {
      readContractState: contractId => contractId === CONTRACT
        ? Promise.reject('Not Found')
        : Promise.resolve({
          vouched: {
            [TOM]: [{ service: createKey('M') }]
          }
        })
    },
    transaction: {
      id: createKey('z'),
      owner: JUSTIN,
      tags: [{ name: 'Data-Source', value: CONTRACT2 }]
    },
    block: {
      height: 10000000,
      timestamp: Date.now()
    }
  }

  const { handle } = await import('../src/index.js')
  const state = {
    balances: {},
    stamps: {
      [CONTRACT2]: [TOM]
    },
    assets: {},
    vouchDAO: createKey('V'),
    lastReward: 1111000,
    pairs: []
  }

  const action = {
    caller: JUSTIN,
    input: {
      function: 'stamp'
    }
  }

  try {
    await handle(state, action)
  } catch (e) {
    assert.equal(e.message, 'Caller is not vouched!')
  }

  globalThis.SmartWeave = {}
})

test('tx must be valid', () => {

})

test.run()