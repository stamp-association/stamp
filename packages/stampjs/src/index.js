import svcs from "./svcs/index.js";
//import { register } from "./lib/register.js";
import { stamp } from "./lib/stamp.js";
import { count } from "./lib/count.js";
import { counts } from "./lib/counts.js";
import { hasStamped } from "./lib/has-stamped.js";

import services from "./svcs/index.js";

/**
 * @typedef {Object} Env
 * @property {any} warp
 * @property {any} arweave
 * @property {string} [dre]
 * @property {string} [contract]
 * @property {string} [jwk]
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
 * @typedef {Object} StampJS
 * @property {Stamp} stamp
 * @property {Count} count
 * @property {Counts} counts
 * @property {HasStamped} hasStamped
 */

export default {
  /**
   * @param {Env} env
   * @returns {StampJS}
   */
  init: function ({
    warp,
    arweave,
    dre = "https://dre-1.warp.cc/contract",
    contract = "Hinz6F9gzcVthPUeTn0aef6wy6hLJH5QYQkvMmvCpYk",
    jwk = "use_wallet",
  }) {
    const env = {
      query: services.query,
      vouchServices: services.vouchServices,
      writeInteraction: services.writeInteraction(warp, contract, jwk),
      getState: services.getState(dre),
      dispatch: services.dispatch(arweave),
      getAddress: services.getAddress,
    };
    return {
      //register: (tx) => register(tx).fold(handleError, handleSuccess),
      stamp: (tx, qty, tags) => stamp(env, tx, qty, tags).toPromise(),
      count: (txID) => count(env, txID).toPromise(),
      counts: (txIDs) => counts(env, txIDs).toPromise(),
      hasStamped: (tx) => hasStamped(env, tx).toPromise(),
    };
  },
};
