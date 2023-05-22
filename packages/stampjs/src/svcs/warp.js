import { prop } from "ramda";

export function writeInteraction(warp, contract, jwk) {
  return (input, tags) => {
    return warp
      .contract(contract)
      .connect(jwk)
      .writeInteraction(input, { tags });
  };
}

export function getState(dre) {
  return (tx) =>
    fetch(`${dre}/?id=${tx}`)
      .then((res) => res.json())
      .then(prop("state"))
      .catch((_) => {});
}

export function viewState(warp, contract) {
  return (input) =>
    warp
      .contract(contract)
      .setEvaluationOptions({
        allowBigInt: true,
        unsafeClient: "skip",
        remoteStateSyncEnabled: true,
      })
      .viewState(input)
      .then((result) => result.result);
}
