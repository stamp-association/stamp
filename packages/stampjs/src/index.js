const STAMP = 'QY54ApX4agQPjsi3214GanqpCO7RvWdBqLTAvkGEo8g'
const propEq = (k, v) => o => o[k] === v
const prop = (k) => o => o[k]
const filter = (f) => ls => ls.filter(f)
const length = (ls) => ls.length

export default {
  /**
   * @param {any} env
   */
  init: function ({
    warp,
    dre = 'https://dre-1.warp.cc',
    address, // TODO: future to allow vpst to drive developer incentives
    percent // TODO: future configurable percent for dev token perks
  }) {
    if (!warp || !warp.contract) {
      throw new Error('warp instance is required for stampjs')
    }
    return Object.freeze({
      /**
       * @param {string} transactionId
       * @returns {Promise<any>}
       */
      stamp: async (transactionId) => {
        if (transactionId.length !== 43) {
          throw new Error('Invalid Atomic Token identifier!')
        }
        try {
          await warp.contract(STAMP).syncState(dre + '/contract', { validity: true })
        } catch (e) {
          throw new Error('DRE is not defined correctly! ERROR:', e.message)
        }
        return warp.contract(STAMP).connect('use_wallet')
          .setEvaluationOptions({
            allowBigInt: true,
          })
          .writeInteraction({
            function: 'stamp',
            transactionId,
            timestamp: Date.now()
          }, {
            strict: true,
            tags: [{ name: 'App-Protocol', value: 'Stamp' }]
          })
      },
      /**
       * @param {string} address - Arweave Wallet Address
       * @param {string} transactionId - Atomic Token Asset
       */
      hasStamped: async (address, transactionId) => {
        try {
          await warp.contract(STAMP).syncState(dre + '/contract', { validity: true })
        } catch (e) {
          throw new Error('DRE is not defined correctly! ERROR:', e.message)
        }
        return warp.contract(STAMP)
          .setEvaluationOptions({
            allowBigInt: true,
            internalWrites: true
          })
          .readState()
          .then(prop('cachedValue')).then(prop('state')).then(prop('stamps')).then(Object.values)
          .then(filter(propEq('asset', transactionId)))
          .then(filter(propEq('address', address)))
          .then(length)
          .then(l => l === 1)
      },
      /**
       * @param {string} transactionId - Atomic Token Asset
       */
      count: async (transactionId) => {
        if (transactionId.length !== 43) {
          throw new Error('Invalid Atomic Token identifier!')
        }
        try {
          await warp.contract(STAMP).syncState(dre + '/contract', { validity: true })
        } catch (e) {
          throw new Error('DRE is not defined correctly! ERROR:', e.message)
        }
        return warp.contract(STAMP)
          .setEvaluationOptions({
            allowBigInt: true,
            internalWrites: true
          })
          .readState()
          .then(prop('cachedValue')).then(prop('state')).then(prop('stamps')).then(Object.values)
          .then(filter(propEq('asset', transactionId)))
          .then(as => {
            return {
              total: as.length,
              vouched: as.filter(propEq('vouched', true)).length,
              super: as.filter(propEq('super', true)).length
            }
          })

      },
      /**
       * @param {string[]} assets - array of atomic token assets
       */
      counts: async (assets) => {
        assets.forEach(transactionId => {
          if (transactionId.length !== 43) {
            throw new Error('Invalid Atomic Token identifier!')
          }
        })

        try {
          await warp.contract(STAMP).syncState(dre + '/contract', { validity: true })
        } catch (e) {
          throw new Error('DRE is not defined correctly! ERROR:', e.message)
        }
        return warp.contract(STAMP)
          .setEvaluationOptions({
            allowBigInt: true,
            internalWrites: true
          })
          .readState()
          .then(prop('cachedValue')).then(prop('state')).then(prop('stamps')).then(Object.values)
          .then(stamps => stamps.reduce((a, stamp) => {
            if (assets.includes(stamp.asset)) {
              const _value = a[stamp.asset] || { total: 0, vouched: 0, super: 0 }
              a[stamp.asset] = {
                total: _value.total + 1,
                vouched: stamp.vouched ? _value.vouched + 1 : _value.vouched,
                super: stamp.super ? _value.super + 1 : _value.super
              }
            }
            return a
          }, {}))
      },
      balance: async (addr) => {
        try {
          await warp.contract(STAMP).syncState(dre + '/contract', { validity: true })
        } catch (e) {
          throw new Error('DRE is not defined correctly! ERROR:', e.message)
        }
        return warp.contract(STAMP)
          .setEvaluationOptions({
            allowBigInt: true,
            internalWrites: true
          })
          .viewState({
            function: 'balance',
            target: addr
          })
          .then(prop('result'))
          .then(prop('balance'))
          .then(n => n / 1e12)
      }
    })
  }
}