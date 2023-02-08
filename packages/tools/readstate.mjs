import { WarpFactory, defaultCacheOptions } from 'warp-contracts'

const warp = WarpFactory.forMainnet({ ...defaultCacheOptions, inMemory: true })

async function main() {
  const STAMP = '61vg8n54MGSC9ZHfSVAtQp4WjNb20TaThu6bkQ86pPI'
  await warp.contract(STAMP).syncState('https://dre-1.warp.cc/contract', { validity: true })
  const result = await warp.contract(STAMP)
    .setEvaluationOptions({
      internalWrites: true,
      allowBigInt: true
    })
    .readState()

  console.log(result.cachedValue.state)
}

main()