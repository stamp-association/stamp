import { stamp } from "./lib/stamp.js";
import { count } from "./lib/count.js";
import { counts } from "./lib/counts.js";
import { hasStamped } from "./lib/has-stamped.js";
import { balance } from './lib/balance.js';

import services from "./svcs/index.js";

/**
 * @typedef {Object} Env
 * @property {string} [process]
 */

/**
 * @callback Stamp
 * @param {string} transactionId
 * @param {number} [qty] - integer representing the number of tokens to transfer
 * @param {{name: string, value: string}[]} [tags] - tx tags to be added to the transaction
 * @returns {Promise<any>}
 */

/**
 * @callback HasStamped
 * @param {string | string[]} transactionId - Atomic Token Asset
 * @returns {Promise<boolean>}
 */

/**
 * @typedef CountResult
 * @property {number} total
 * @property {number} vouched
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
 * @param {string} address - Wallet Address
 * @returns {Promise<number>}
 */

/**
 * @typedef {Object} StampJS
 * @property {Stamp} stamp
 * @property {Count} count
 * @property {Counts} counts
 * @property {HasStamped} hasStamped
 * @property {Balance} balance
 */

export default {
  /**
   * @param {Env} env
   * @returns {StampJS}
   */
  init: function ({
    process = "bLK9hMjx3jsJ4Ldjn-tvuTB1_PHzYV6ivPkv7_D8zKg",
  }) {
    const env = {
      writeInteraction: services.writeInteraction(process),
      readInteraction: services.readInteraction(process),
      aoDryRun: services.aoDryRun(process),
      getAddress: services.getAddress,
    };
    return {
      //register: (tx) => register(tx).fold(handleError, handleSuccess),
      stamp: (tx, qty, tags) => stamp(env, tx, qty, tags).toPromise(),
      count: (txID) => count(env, txID).toPromise(),
      counts: (txIDs) => counts(env, txIDs).toPromise(),
      hasStamped: (tx) => hasStamped(env, tx).toPromise(),
      balance: (address) => balance(env, address).toPromise()
    };
  },
};
