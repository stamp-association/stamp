import { arGql } from "ar-gql";
import Arweave from "arweave";

const arweave = Arweave.init({});
const argql = arGql(gateway("graphql"));

export async function dispatch(txId, tags) {
  const tx = await arweave.createTransaction({ data: txId });
  tags.forEach((t) => tx.addTag(t.name, t.value));
  if (!window.arweaveWallet) {
    return Promise.reject("Wallet not found!");
  }
  return window.arweaveWallet.dispatch(tx);
}

export const query = ({ query, variables }) => {
  return argql.all
    .bind(argql)(query, variables)
    .then((edges) => edges.map((e) => e.node));
};

export const vouchServices = () =>
  fetch(
    "https://dre-1.warp.cc/contract/?id=_z0ch80z_daDUFqC9jHjfOL8nekJcok4ZRkE_UesYsk&query=$.votes"
  )
    .then((r) => r.json())
    .then(({ result }) => result[0].filter((v) => v.key === "Voucher"))
    .then((vouchedVotes) => vouchedVotes.map((v) => v.value));

function gateway(path) {
  return `https://arweave.net/${path}`;
}
