import { WarpFactory, defaultCacheOptions } from 'warp-contracts'

const warp = WarpFactory.forMainnet({ ...defaultCacheOptions, inMemory: true })

async function main() {
  const STAMP = '61vg8n54MGSC9ZHfSVAtQp4WjNb20TaThu6bkQ86pPI'
  //const STAMP = '8iZh2EveCFkMeKJyKkln_WcQtfuF9YihQe3wc0ic9QA'
  const c = warp.contract(STAMP)
  const result =
    await (await c.syncState('https://dre-1.warp.cc/contract', { validity: true }))
      .setEvaluationOptions({
        internalWrites: true,
        allowBigInt: true
      })
      .readState()

  // const result = await warp.contract(STAMP)
  //   .setEvaluationOptions({
  //     internalWrites: true,
  //     unsafeClient: 'skip',
  //     allowBigInt: true
  //   })
  //   .readState(1121788)

  const results = await Promise.all(Object.values(result.cachedValue.state.stamps)
    .filter(x => x.flagged === false)
    .filter(x => x.asset !== 'UoDCeYYmamvnc0mrElUxr5rMKUYRaujo9nmci206WjQ')
    .map(s => warp.contract(s.asset).readState())
  )
  console.log(results.length)



}

main()