export function writeInteraction(warp, contract, jwk) {
  return (input, tags) => {
    return warp.contract(contract)
      .connect(jwk)
      .writeInteraction(input, { tags })
  }
}