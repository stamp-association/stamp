import Bundlr from '@bundlr-network/client';
import assert from 'assert';
import fs from 'fs'

const pkg = JSON.parse(fs.readFileSync('./package.json'))

const walletFile = process.argv[2]

assert(walletFile, 'Wallet required!')

try {
  const jwk = JSON.parse(fs.readFileSync(walletFile).toString());

  const bundlr = new Bundlr.default("http://node2.bundlr.network", "arweave", jwk);

  const data = fs.readFileSync('./dist/widget.js')

  const tags = [
    { name: 'Content-Type', value: 'application/javascript' },
    { name: 'App-Name', value: 'Permapage-Widget' },
    { name: 'App-Version', value: '0.0.1' },
    { name: 'Widget-Id', value: "passport" },
    { name: 'Widget-Name', value: pkg.name },
    { name: 'Widget-Version', value: pkg.version },
    { name: 'Widget-Desc', value: pkg.description },
    { name: 'Widget-Docs', value: 'https://permanotes.app/#/notes/uwzAOorYh2cYTHG9YQJFS9hSLI3erYMa7N9L4NndWOI' }
  ]

  const tx = await bundlr.createTransaction(data, { tags })
  await tx.sign()
  const result = await tx.upload()

  console.log('Deployed!')

  console.log('TransactionId: ', result.data.id)
} catch (e) {
  console.log('ERROR: ', e.message)
}