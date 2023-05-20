import { WarpFactory } from 'warp-contracts'
import { DeployPlugin, ArweaveSigner } from 'warp-contracts-plugin-deploy'

import fs from 'fs'

const src = fs.readFileSync('./dist/index.js', 'utf-8')
const jwk = JSON.parse(fs.readFileSync('./test-stamp.json', 'utf-8'))
const signer = new ArweaveSigner(jwk)
const warp = WarpFactory.forMainnet().use(new DeployPlugin())

async function main() {
  const tx = await warp.createSource({ src }, signer)
  const srcTx = await warp.saveSource(tx)
  console.log(srcTx)
  const result = await warp
    .contract('cXvR4YKLQXJecKRr9iTnejNy2dXeMgWiUqrLjTXxTCQ')
    .connect(jwk)
    .evolve(srcTx)

  console.log(result)
}

main()