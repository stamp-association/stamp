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
import { omit } from "ramda";

const EVOLVABLE = 1241679;

export async function handle(state, action) {
  if (action.input.function === "__init") {
    const balances = action.input.args.initialBalances;
    await Promise.all(
      Object.keys(balances).map((k) => SmartWeave.kv.put(k, balances[k]))
    );
    return { state: omit(["initialBalances"], action.input.args) };
  }

  const env = {
    vouchContract: state.vouchDAO,
    readState: (contractId) =>
      SmartWeave.contracts.readContractState.bind(SmartWeave.contracts)(
        contractId
      ),
    height: SmartWeave?.block?.height,
    timestamp: SmartWeave?.block?.timestamp,
    id: SmartWeave?.transaction?.id,
    owner: SmartWeave?.transaction?.owner,
    tags: SmartWeave?.transaction?.tags,
    contractId: SmartWeave?.contract?.id,
    get: (k) => SmartWeave.kv.get.bind(SmartWeave.kv)(k),
    put: (k, v) => SmartWeave.kv.put.bind(SmartWeave.kv)(k, v),
  };

  if (action.input.function !== "balance") {
    // check for rewards on write interactions
    state = await reward(env)(state, action).toPromise().catch(handleError);
    // check for credits on write interactions
    state = credit(env)(state, action);
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
      return transfer(env)(state, action).toPromise().catch(handleError);
    case "evolve":
      return env.height < EVOLVABLE ? evolve(state, action) : { state };
    case "allow":
      return allow(env)(state, action).toPromise().catch(handleError);
    case "claim":
      return claim(env)(state, action).toPromise().catch(handleError);
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
