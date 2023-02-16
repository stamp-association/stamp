import { WarpFactory, defaultCacheOptions } from 'warp-contracts'

const warp = WarpFactory.forMainnet()

async function main() {
  const STAMP = '61vg8n54MGSC9ZHfSVAtQp4WjNb20TaThu6bkQ86pPI'
  //const STAMP = '8iZh2EveCFkMeKJyKkln_WcQtfuF9YihQe3wc0ic9QA'
  await warp.contract(STAMP).syncState('https://dre-1.warp.cc/contract', { validity: true })
  const result = await warp.contract(STAMP)
    .setEvaluationOptions({
      internalWrites: true,
      allowBigInt: true
    })
    .readState()

  const results = await Promise.all(Object.values(result.cachedValue.state.stamps)
    .filter(x => x.flagged === false)
    .filter(x => x.asset !== 'UoDCeYYmamvnc0mrElUxr5rMKUYRaujo9nmci206WjQ')
    .map(s => warp.contract(s.asset).readState())
  )
  console.log(results)



}

main()