import { WarpFactory } from 'warp-contracts'
import Stamps from '@permaweb/stampjs'
import { ArweaveWebWallet } from 'arweave-wallet-connector'

//import Arweave from 'arweave'

const arweave = Arweave.init({ host: 'arweave.net', port: 443, protocol: 'https' })
const warp = WarpFactory.forMainnet()

const stamps = Stamps.init({ warp, arweave })

document.getElementById('form').addEventListener('submit', async e => {
  e.preventDefault()
  const wallet = new ArweaveWebWallet({
    name: 'STAMPS'
  })

  wallet.setUrl('arweave.app')
  await wallet.connect()

  await stamps.stamp('M8wS5AwiXZRRpCdJheKO5fKZM_FhoCEtd_gQDBtAZcA')
})