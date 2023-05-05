import { reduce, values, keys, add, mergeAll, sum } from "ramda";

export function allocate(balances, reward) {
  var total = reduce(
    add,
    0,
    values(balances).filter((v) => v > 0)
  );

  const allocation = mergeAll(
    reduce(
      (a, s) => {
        const asset = s[0];
        const balance = s[1];

        // handle zero balance
        if (balance < 1) {
          return a;
        }

        var pct = (balance / total) * 100;
        const coins = Math.round(reward * (pct / 100));

        return [...a, { [asset]: Number(coins) }];
      },
      [],
      Object.entries(balances)
    )
  );

  // handle off by one errors :)
  var remainder = reward - sum(values(allocation));
  var iterator = keys(allocation).entries();
  while (remainder > 0) {
    allocation[iterator.next().value[1]]++;
    remainder--;
  }

  return allocation;
}
