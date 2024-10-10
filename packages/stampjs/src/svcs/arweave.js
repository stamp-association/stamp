import { arGql } from "ar-gql";
import { path, pluck } from 'ramda'

export async function getAddress() {
  if (!window.arweaveWallet) {
    return Promise.reject("Wallet not found!");
  }
  return window.arweaveWallet.getActiveAddress();
}