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

export function readInteraction(process, delay) {
  return async (messageTx, dataSource) => {
    await new Promise((resolve) => setTimeout(resolve, delay))
    const res = await results({
      message: messageTx,
      process,
      limit: 5,
      sort: 'DESC'
    })

    const stampResult = res.edges.map((edge) => edge.node).filter((node) => node.Messages.some((msg) => msg.Tags.some((tag) => tag.name === 'Data-Source' && tag.value === dataSource) && msg.Tags.some((tag) => tag.name === 'Action' && tag.value === 'Write-Stamp-Result')))[0]

    if (!stampResult) {
      throw new Error('No stamp result found')
    }

    return { data: stampResult.Messages[0].Data ?? "No Data", result: stampResult.Messages[0].Tags.find((tag) => tag.name === 'Result').value }
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