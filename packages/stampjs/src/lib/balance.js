import { fromPromise } from "../adts/async.js";

export function balance(env, address) {
  const viewState = fromPromise(env.viewState);

  return viewState({ function: "balance", target: address })
    .map((r) => r.balance || 0);
}
