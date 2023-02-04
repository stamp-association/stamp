const STAMP = 'QY54ApX4agQPjsi3214GanqpCO7RvWdBqLTAvkGEo8g'

export default {
  init: function ({
    warp,
    dre,
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
        await warp.contract(STAMP).syncState(dre, { validity: true })
        return warp.contract(STAMP).connect('use_wallet').writeInteraction({
          transactionId,
          timestamp: Date.now()
        })
      },
      count: (transactionId) => {

      },
      counts: () => null,
      balance: () => null
    })
  }
}