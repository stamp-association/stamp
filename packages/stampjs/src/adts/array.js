const concat = (x) => (m) => x.concat(m);

function runTraverse(name, fn) {
  return function (acc, x) {
    const m = fn(x);

    // if (!((isApply(acc) || isArray(acc)) && isSameType(acc, m))) {
    //   throw new TypeError(`Array.${name}: Must wrap Applys of the same type`)
    // }

    // if (isArray(m)) {
    //   return ap(acc, map(v => concat([v]), m))
    // }

    return m.map((v) => concat([v])).ap(acc);
  };
}

function sequence(f, m) {
  return m.reduceRight(
    runTraverse("sequence", (x) => x),
    f([])
  );
}

export const array = {
  sequence,
};
