import { WarpFactory, defaultCacheOptions } from 'warp-contracts/mjs'
import fs from 'fs'
import { path } from 'ramda'

const walletFile = process.argv.slice(2)[0]
const wallet = JSON.parse(fs.readFileSync(walletFile, 'utf-8'))

const CONTRACT = 'QY54ApX4agQPjsi3214GanqpCO7RvWdBqLTAvkGEo8g'

const warp = WarpFactory.forMainnet({ ...defaultCacheOptions, inMemory: true })
await warp.contract(CONTRACT)
  .syncState('https://dre-1.warp.cc/contract', { validity: true })
//.readState()

const result = await warp.contract(CONTRACT).connect(wallet)
  .setEvaluationOptions({
    allowBigInt: true,
    internalWrites: true,
    useVM2: true
  })
  .readState()

console.log('result', result)
// console.log(
//   result.cachedValue.state.balances['vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI']
//   / 1e12
// )