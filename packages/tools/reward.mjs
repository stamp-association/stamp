import { WarpFactory, defaultCacheOptions } from 'warp-contracts'
import fs from 'fs'

const wallet = JSON.parse(fs.readFileSync('./stamp.json', 'utf-8'))
const warp = WarpFactory.forMainnet()

async function main() {
  const STAMP = '61vg8n54MGSC9ZHfSVAtQp4WjNb20TaThu6bkQ86pPI'
  await warp.contract(STAMP).syncState('https://dre-1.warp.cc/contract', { validity: true })
  const result = await warp.contract(STAMP)
    .connect(wallet)
    .setEvaluationOptions({
      internalWrites: true,
      allowBigInt: true
    })
    //.dryWrite({
    .writeInteraction({
      function: 'reward',
      timestamp: Date.now()
    }, { strict: true })

  console.log(result)
}

main()