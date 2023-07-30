import map from 'ramda/src/map'
import take from 'ramda/src/take'
import Stamps from '@permaweb/stampjs'
import { InjectedArweaveSigner } from "warp-contracts-plugin-signature";
import { WarpFactory, LoggerFactory } from 'warp-contracts'
import { ArweaveWebWallet } from "arweave-wallet-connector";

import Arweave from 'arweave'

LoggerFactory.INST.logLevel('fatal')

const arweave = Arweave.default.init({ host: 'g8way.io', port: 443, protocol: 'https' })
const _stamps = Stamps.init({ warp: WarpFactory.forMainnet(), arweave })

export const hasStamped = (txId) => _stamps.hasStamped(txId)
export const stamp = async (txId) => {
  let userSigner = null

  if (globalThis.arweaveWallet) {
    await arweaveWallet.connect(
      ["SIGN_TRANSACTION", "ACCESS_PUBLIC_KEY", "ACCESS_ADDRESS", "SIGNATURE"],
      { name: "stamp-widget" }
    )
    userSigner = new InjectedArweaveSigner(arweaveWallet);
  } else {
    const wallet = new ArweaveWebWallet({
      name: "stamp-widget",
    });
    wallet.setUrl("arweave.app");
    await wallet.connect();

    userSigner = new InjectedArweaveSigner(wallet);
  }

  userSigner.getAddress = arweaveWallet.getActiveAddress;
  await userSigner.setPublicKey();
  const x_stamps = Stamps.init({ warp: WarpFactory.forMainnet(), arweave, wallet: userSigner })

  return x_stamps.stamp(txId)
}
export const getStampCount = async (txId) => await _stamps.count(txId)