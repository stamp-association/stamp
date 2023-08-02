import svcs from "./svcs/index.js";
//import { register } from "./lib/register.js";
import { stamp } from "./lib/stamp.js";
import { count } from "./lib/count.js";
import { counts } from "./lib/counts.js";
import { hasStamped } from "./lib/has-stamped.js";
import { balance } from './lib/balance.js';

import services from "./svcs/index.js";

/**
 * @typedef {Object} Env
 * @property {any} warp
 * @property {any} arweave
 * @property {any} wallet
 * @property {string} [dre]
 * @property {string} [contract]
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
    warp,
    arweave,
    dre = "https://dre-5.warp.cc/contract",
    contract = "TlqASNDLA1Uh8yFiH-BzR_1FDag4s735F3PoUFEv2Mo",
    wallet = "use_wallet",
  }) {
    const env = {
      query: services.query,
      vouchServices: services.vouchServices,
      writeInteraction: services.writeInteraction(warp, contract, wallet),
      getState: services.getState(dre),
      dispatch: services.dispatch(arweave),
      getAddress: services.getAddress,
      viewState: services.viewState(warp, contract),
      bundlr: services.bundlr
    };
    return {
      //register: (tx) => register(tx).fold(handleError, handleSuccess),
      stamp: (tx, qty, tags) => stamp(env, tx, qty, tags).toPromise(),
      count: (txID) => count(env, txID).toPromise(),
      counts: (txIDs) => counts(env, txIDs).toPromise(),
      hasStamped: (tx) => hasStamped(env, tx).toPromise(),
      balance: (address) => balance(env, address).toPromise(),
    };
  },
};
