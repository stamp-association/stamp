import { WarpFactory } from 'warp-contracts'
import Stamps from '../../src'
import { ArweaveWebWallet } from 'arweave-wallet-connector'

//import Arweave from 'arweave'

const arweave = Arweave.init({ host: 'arweave.net', port: 443, protocol: 'https' })
const warp = WarpFactory.forMainnet()

const stamps = Stamps.init({ warp, arweave })


document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const wallet = new ArweaveWebWallet(
    { name: 'STAMPS' },
    { state: { url: 'arweave.app' }}
  )
  if (window.arweaveWallet) {
    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "DISPATCH", "SIGN_TRANSACTION"]);
  } else {
    await wallet.connect();
  }
  const stampTx = e.target?.[0]?.value 
  const res = await stamps.stamp(stampTx || 'M8wS5AwiXZRRpCdJheKO5fKZM_FhoCEtd_gQDBtAZcA')
})

document.getElementById('superStampForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const wallet = new ArweaveWebWallet(
    { name: 'STAMPS' },
    { state: { url: 'arweave.app' }}
  )
  if (window.arweaveWallet) {
    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "DISPATCH", "SIGN_TRANSACTION"]);
  } else {
    await wallet.connect();
  }
  const stampTx = e.target?.[0]?.value 
  const quantity = e.target?.[1]?.value
  const res = await stamps.stamp(stampTx || 'M8wS5AwiXZRRpCdJheKO5fKZM_FhoCEtd_gQDBtAZcA', quantity || 100)
  console.log({ res })
})

document.getElementById('getStampsByAssetForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const wallet = new ArweaveWebWallet(
    { name: 'STAMPS' },
    { state: { url: 'arweave.app' }}
  )
  if (window.arweaveWallet) {
    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "DISPATCH", "SIGN_TRANSACTION"]);
  } else {
    await wallet.connect();
  }
  const assetTx = e.target?.[0]?.value
  const res = await stamps.count(assetTx || 'M8wS5AwiXZRRpCdJheKO5fKZM_FhoCEtd_gQDBtAZcA')
})

const assets = ['M8wS5AwiXZRRpCdJheKO5fKZM_FhoCEtd_gQDBtAZcA', 'SepAjMSk5IOD8LPQRsc5KO275uM_m8D6SM6pMqvzAyI']

document.getElementById('getStampsByAssetsForm').addEventListener('submit', async (e) => {
  console.log('Get stamps by assets...')
  e.preventDefault()
  const wallet = new ArweaveWebWallet(
    { name: 'STAMPS' },
    { state: { url: 'arweave.app' }}
  )
  if (window.arweaveWallet) {
    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "DISPATCH", "SIGN_TRANSACTION"]);
  } else {
    await wallet.connect();
  }
  const assetsTx = e.target?.[0]?.value?.split(',')
  console.log({assetsTx})
  const res = await stamps.counts(assetsTx?.[0] == '' ? assets : assetsTx)
  console.log({ res })
})

document.getElementById('hasStampedForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const wallet = new ArweaveWebWallet(
    { name: 'STAMPS' },
    { state: { url: 'arweave.app' }}
  )
  if (window.arweaveWallet) {
    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "DISPATCH", "SIGN_TRANSACTION"]);
  } else {
    await wallet.connect();
  }
  const asset = e.target?.[0]?.value
  const res = await stamps.hasStamped(asset || assets[0])
  console.log({ res })
})

document.getElementById('hasStampedMultipleForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const wallet = new ArweaveWebWallet(
    { name: 'STAMPS' },
    { state: { url: 'arweave.app' }}
  )
  if (window.arweaveWallet) {
    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "DISPATCH", "SIGN_TRANSACTION"]);
  } else {
    await wallet.connect();
  }
  const assetsTx = e.target?.[0]?.value?.split(',')
  const res = await stamps.hasStamped(assetsTx?.[0] == '' ? assets : assetsTx)
  console.log({ res })
})


document.getElementById('balanceForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const wallet = new ArweaveWebWallet(
    { name: 'STAMPS' },
    { state: { url: 'arweave.app' }}
  )
  if (window.arweaveWallet) {
    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "DISPATCH", "SIGN_TRANSACTION"]);
  } else {
    await wallet.connect();
  }
  const res = await stamps.balance(await window.arweaveWallet.getActiveAddress())
})
