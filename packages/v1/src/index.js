import { transfer } from "./write/transfer.js";
import { balance } from "./read/balance.js";
import { stamp } from "./write/stamp.js";
import { reward } from "./cron/reward.js";
import { credit } from "./cron/credit.js";
import { register } from "./write/register.js";
import { superStamps } from "./write/super-stamps.js";
import { evolve } from "./write/evolve.js";
import { allow } from "./write/allow.js";
import { claim } from "./write/claim.js";
import { clear } from './cron/clear.js'

const EVOLVABLE = 1241679;

export async function handle(state, action) {
  const env = {
    vouchContract: state.vouchDAO,
    readState: async (contractTx) => {
      const result = await SmartWeave.contracts.readContractState(contractTx);
      //.catch((_) => Promise.reject("Not Found."))
      //console.log(`READ STATE: ${contractTx}`)
      return result;
    },
    height: SmartWeave?.block?.height,
    timestamp: SmartWeave?.block?.timestamp,
    id: SmartWeave?.transaction?.id,
    owner: SmartWeave?.transaction?.owner,
    tags: SmartWeave?.transaction?.tags,
    contractId: SmartWeave?.contract?.id,
  };

  if (action.input.function === "stamp") {
    // check for rewards on write interactions
    state = await reward(env)(state, action)
      .toPromise()
      .catch((_) => state);
    // check for credits on write interactions
    state = credit(env)(state, action);
    // clear stamp history every six months
    state = clear(env, state)
  }

  // handle function
  switch (action?.input?.function) {
    case "register":
      return register(env)(state, action).fold(handleError, handleSuccess);
    case "stamp":
      return stamp(env)(state, action)
        .chain(superStamps(env))
        .toPromise()
        .catch(handleError);
    case "balance":
      return balance(env)(state, action).toPromise().catch(handleError);
    case "transfer":
      return transfer(state, action).toPromise().catch(handleError);
    case "evolve":
      return env.height < EVOLVABLE ? evolve(state, action) : { state };
    case "allow":
      return allow(env)(state, action).toPromise().catch(handleError);
    case "claim":
      return claim(state, action).toPromise().catch(handleError);
    default:
      throw new ContractError("no function defined!");
  }
}

function handleError(msg) {
  throw new ContractError(msg);
}

function handleSuccess(result) {
  return result;
}
