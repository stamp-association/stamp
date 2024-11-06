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

function backoffResults(results, dataSource, delay, retries = 3) {
  return async (...args) => {
    if (retries === 0) {
      throw new Error('Max retries reached')
    }
    const res = await results(...args)
      .then((res) => {
        const stampResult = res.edges.map((edge) => edge.node).filter((node) => node.Messages.some((msg) => msg.Tags.some((tag) => tag.name === 'Data-Source' && tag.value === dataSource) && msg.Tags.some((tag) => tag.name === 'Action' && tag.value === 'Write-Stamp-Result')))[0]
        if (!stampResult) {
          throw new Error('No stamp result found')
        }
        return stampResult
      })
      .catch(async (_) => {
        await new Promise((resolve) => setTimeout(resolve, delay))
        return backoff(results, dataSource, delay, retries - 1)(...args)
    })
    return res
  }
}

export function readInteraction(process, delay) {
  return async (messageTx, dataSource) => {
    const backedoffResults = backoffResults(results, dataSource, delay)
    const stampResult = await backedoffResults({
      message: messageTx,
      process,
      limit: 5,
      sort: 'DESC'
    })

    return stampResult
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