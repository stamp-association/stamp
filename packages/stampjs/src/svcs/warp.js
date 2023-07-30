import { prop } from "ramda";

export function writeInteraction(warp, contract, wallet) {
  return (input, tags) => {
    return warp
      .contract(contract)
      .connect(wallet)
      .writeInteraction(input, { tags })
  };
}

export function getState(dre) {
  return (tx) =>
    fetch(`${dre}/?id=${tx}`)
      .then(r => r.ok ? r : fetch(`https://dre-6.warp.cc/contract/?id=${tx}`))
      .then(r => r.ok ? r : fetch(`https://dre-5.warp.cc/contract/?id=${tx}`))
      .then((res) => res.json())
      .then(prop("state"))
      .catch((_) => ({}));
}

export function viewState(warp, contract) {
  const options = {
    allowBigInt: true,
    unsafeClient: "skip",
    //internalWrites: true,
    remoteStateSyncEnabled: true,
  }
  return (input) =>
    warp
      .contract(contract)
      .setEvaluationOptions(options)
      .viewState(input)
      .catch(_ => warp
        .contract(contract)
        .setEvaluationOptions({ ...options, remoteStateSyncSource: 'https://dre-6.warp.cc/contract' })
        .viewState(input))
      .catch(_ => warp
        .contract(contract)
        .setEvaluationOptions({ ...options, remoteStateSyncSource: 'https://dre-5.warp.cc/contract' })
        .viewState(input))
      .then((result) => result.result);
}
