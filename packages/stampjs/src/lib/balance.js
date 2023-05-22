import { fromPromise } from "../adts/async.js";

export function balance(env) {
  const viewState = fromPromise(env.viewState);
  const getAddress = fromPromise(env.getAddress);
  return getAddress()
    .chain((address) => viewState({ function: "balance", target: address }))
    .map((r) => r.balance || 0);
}
