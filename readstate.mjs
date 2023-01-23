import { WarpFactory } from 'warp-contracts/mjs'
import fs from 'fs'
import { path } from 'ramda'

const walletFile = process.argv.slice(2)[0]
const wallet = JSON.parse(fs.readFileSync(walletFile, 'utf-8'))

const CONTRACT = 'QY54ApX4agQPjsi3214GanqpCO7RvWdBqLTAvkGEo8g'

const warp = WarpFactory.forMainnet()
const result = await warp.contract(CONTRACT).connect(wallet)
  .setEvaluationOptions({
    internalWrites: true,
    allowBigInt: true,
    useVM2: true
  })
  .readState()


console.log('result', result)
console.log(
  result.cachedValue.state.balances['vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI']
  / 1e12
)