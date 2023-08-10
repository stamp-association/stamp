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
      .then(r => r.ok ? r : fetch(`https://dre-u.warp.cc/contract/?id=${tx}`))
      .then((res) => res.json())
      .then(prop("state"))
      .catch((_) => ({}));
}

export function viewState(warp, contract, dre) {
  const options = {
    allowBigInt: true,
    unsafeClient: "skip",
    //internalWrites: true,
    remoteStateSyncEnabled: true,
    remoteStateSyncSource: dre || 'https://dre-u.warp.cc/contract'
  }
  return (input) =>
    warp
      .contract(contract)
      .setEvaluationOptions(options)
      .viewState(input)
      .then((result) => result.result);
}
