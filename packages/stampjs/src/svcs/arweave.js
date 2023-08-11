import { arGql } from "ar-gql";
import { path, pluck } from 'ramda'

export async function getAddress() {
  if (!window.arweaveWallet) {
    return Promise.reject("Wallet not found!");
  }
  return window.arweaveWallet.getActiveAddress();
}

export function dispatch(arweave) {
  return async (txId, tags) => {
    const tx = await arweave.createTransaction({ data: "STAMP" });
    tags.forEach((t) => tx.addTag(t.name, t.value));
    if (!window.arweaveWallet) {
      return Promise.reject("Wallet not found!");
    }
    return window.arweaveWallet.dispatch(tx);
  };
}

export const bundlr = ({ query, variables }) => {
  return fetch('https://node2.bundlr.network/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  }).then(res => res.json())
    .then(path(['data', 'transactions', 'edges']))
    .then(pluck('node'))
}

export const query = (graphql) => ({ query, variables }) => {
  const argql = arGql(graphql);
  return argql.all
    .bind(argql)(query, variables)
    .then((edges) => edges.map((e) => e.node));
};

export const vouchServices = (dre) => () =>
  fetch(
    `${dre}/?id=_z0ch80z_daDUFqC9jHjfOL8nekJcok4ZRkE_UesYsk&query=$.votes`
  )
    .then((r) => r.json())
    .then(({ result }) => result[0].filter((v) => v.key === "Voucher"))
    .then((vouchedVotes) => vouchedVotes.map((v) => v.value));

