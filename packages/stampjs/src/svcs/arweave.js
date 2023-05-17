import { arGql } from "ar-gql";

const argql = arGql(gateway("graphql"));

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
