const { WarpFactory } = require('warp-contracts')
const fs = require('fs')

const walletFile = process.argv.slice(2)[0]
const wallet = JSON.parse(fs.readFileSync(walletFile, 'utf-8'))

const CONTRACT = 'aSMILD7cEJr93i7TAVzzMjtci_sGkXcWnqpDkG6UGcA'
const warp = WarpFactory.forMainnet()
const contract = warp.contract(CONTRACT).connect(wallet).setEvaluationOptions({
  allowUnsafeClient: true,
  allowBigInt: true
})

async function main() {
  const result = await contract.writeInteraction({
    function: 'reward',
    timestamp: Date.now()
  })

  console.log('result', result)
}

main()