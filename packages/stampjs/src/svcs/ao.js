import { message, createDataItemSigner, dryrun, results } from "@permaweb/aoconnect"

export function writeInteraction(process) {
  return (tags) => {
    return message({ 
      process,
      tags,
      signer: createDataItemSigner(window.arweaveWallet) 
    })
  };
}

export function readInteraction(process) {
  return (tx) => {
    return results({
      message: tx,
      process,
      limit: 5,
      sort: 'DESC'
    })
  }
}

export function aoDryRun(process) {
  return (tags) => {
    return dryrun({
      process,
      tags,
      signer: createDataItemSigner(window.arweaveWallet) 
    })
  }
}