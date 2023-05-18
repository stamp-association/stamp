import svcs from "./svcs/index.js";
import { register } from "./lib/register.js";
import { stamp } from "./lib/stamp.js";
import { count } from "./lib/count.js";
import { counts } from "./lib/counts.js";

import services from "./svcs/index.js";

export default {
  init: function (
    warp,
    options = {
      dre: "https://dre-1.warp.cc/contract",
      contract: "no85rSPaj6zpKExVV_A1WSsJFoGdES_xEMxVIfMzt3M",
      jwk: "use_wallet",
    }
  ) {
    const env = {
      query: services.query,
      vouchServices: services.vouchServices,
      writeInteraction: services.writeInteraction(
        warp,
        options.contract,
        options.jwk
      ),
      getState: services.getState(dre),
      dispatch: services.dispatch,
      getAddress: services.getAddress,
    };
    return {
      //register: (tx) => register(tx).fold(handleError, handleSuccess),
      stamp: (tx, qty, tags) => stamp(env, tx, qty, tags).toPromise(),
      count: (txID) => count(env, txID).toPromise(),
      counts: (txIDs) => counts(env, txIDs).toPromise(),
      //hasStamped: (tx) => hasStamped(tx).toPromise(),
    };
  },
};
