const STAMP = 'QY54ApX4agQPjsi3214GanqpCO7RvWdBqLTAvkGEo8g'
const propEq = (k, v) => o => o[k] === v
const prop = (k) => o => o[k]
const filter = (f) => ls => ls.filter(f)
const length = (ls) => ls.length

export default {
  init: function ({
    warp,
    dre = 'https://dre-1.warp.cc',
    address,
    percent
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
      hasStamped: (address) => {

      },
      count: (transactionId) => {
        return warp.contract(STAMP)
          .setEvaluationOptions({
            allowBigInt: true,
            internalWrites: true
          })
          .readState()
          .then(prop('cachedValue')).then(prop('state')).then(prop('stamps')).then(Object.values)
          .then(filter(propEq('asset', transactionId)))
          .then(length)
      },
      counts: () => null,
      balance: (addr) => warp.contract(STAMP)
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
    })
  }
}