import { getSubdomain } from './utils.js'

const STAMP = '61vg8n54MGSC9ZHfSVAtQp4WjNb20TaThu6bkQ86pPI'

const propEq = (k, v) => o => o[k] === v
const prop = (k) => o => o[k]
const filter = (f) => ls => ls.filter(f)
const length = (ls) => ls.length

/**
 * @typedef {Object} Env
 * @property {any} warp
 * @property {string} [dre]
 * @property {string} [address]
 * @property {number} [percent]
 */

/**
 * @callback Stamp
 * @param {string} transactionId
 * @param {number} qty? - integer representing the number of tokens to transfer
 * @param {{name: string, value: string}[]} tags? - tx tags to be added to the transaction
 * @returns {Promise<any>}
 */

/**
 * @callback HasStamped
 * @param {string} address - Arweave Wallet Address
 * @param {string} transactionId - Atomic Token Asset
 * @returns {Promise<boolean>}
 */

/**
 * @typedef CountResult
 * @property {number} total
 * @property {number} vouched
 * @property {number} super
 */

/**
 * @callback Count
 * @param {string} transactionId - Atomic Token Asset
 * @returns {Promise<CountResult>}
 */

/**
 * @callback Counts
 * @param {string[]} assets - Atomic Token Identifiers
 * @returns {Promise<CountResult[]}
 */

/** 
 * @callback Balance
 * @param {string} addr - wallet address
 * @returns {Promise<number>}
 */

/** 
 * @callback OriginCount
 * @param {string} subdomain - subdomain origin
 * @returns {Promise<number>}
 */

/**
 * @typedef {Object} StampJS
 * @property {Stamp} stamp
 * @property {Count} count
 * @property {Counts} counts
 * @property {HasStamped} hasStamped
 * @property {Balance} balance
 * @property {OriginCount} originCount
 */

export default {
  /**
   * @param {Env} env
   * @returns {StampJS}
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
    /**
     * @type {Stamp} stamp
     */
    async function stamp(transactionId, qty = 0, tags = []) {
      if (transactionId.length !== 43) {
        throw new Error('Error: Invalid Atomic Token identifier!')
      }
      if (typeof qty !== 'number') {
        throw new Error('Error: qty must be a integer!')
      }

      try {
        await warp.contract(STAMP).syncState(dre + '/contract', { validity: true })
      } catch (e) {
        throw new Error('DRE is not defined correctly! ERROR:', e.message)
      }

      const input = {
        function: 'stamp',
        transactionId,
        timestamp: Date.now()
      }

      if (qty > 0) {
        input.qty = Number(Math.floor(qty).toFixed(0)) * 1e12
      }

      input.subdomain = getSubdomain(window.location.hostname)

      tags = [{ name: 'App-Protocol', value: 'Stamp' }, ...tags]

      return warp.contract(STAMP).connect('use_wallet')
        .setEvaluationOptions({
          allowBigInt: true,
        })
        .writeInteraction(input, {
          strict: true,
          tags
        })
    }

    /**
     * @type {HasStamped} hasStamped
     */
    async function hasStamped(address, transactionId) {
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
    }

    /**
     * @type {Count} count
     */
    async function count(transactionId) {
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
    }

    /**
     * @type {Counts} counts
     */
    async function counts(assets) {
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
    }

    /**
     * @type {Balance} balance
     */
    async function balance(addr) {
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

    /**
     * @type {OriginCount} originCount
     */
    async function originCount(subdomain) {
      if (!subdomain) {
        throw new Error('subdomain is required!')
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
        .viewState({
          function: 'originCount',
          subdomain
        })
        .then(prop('result'))
    }

    return Object.freeze({
      stamp,
      hasStamped,
      count,
      counts,
      balance,
      originCount
    })
  }
}
