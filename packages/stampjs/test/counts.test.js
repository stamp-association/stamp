import { test } from "uvu";
import * as assert from "uvu/assert";

import { counts } from "../src/lib/counts.js";
import svcs from "../src/svcs/index.js";
import fs from "fs";

const query1Result = JSON.parse(
  fs.readFileSync("./test/fixtures/query1.json", "utf-8")
);
const query0Result = JSON.parse(
  fs.readFileSync("./test/fixtures/query0.json", "utf-8")
);

test("ok", async () => {
  let count = 0;
  const env = {
    query: () => {
      if (count === 0) {
        count = 1;
        return Promise.resolve(query0Result);
      } else {
        return Promise.resolve(query1Result);
      }
    },
    bundlr: () => {
      return Promise.resolve(query0Result);
    },
    vouchServices: () => {
      return Promise.resolve([
        "Ax_uXyLQBPZSQ15movzv9-O1mDo30khslqN64qD27Z8",
        "jk0aaivTdKvzeLB_RhpC_ZUoy9CnY2trlEuHQVXulDQ",
      ]);
    },
  };
  const result = await counts(env, [
    "DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs",
    "iXHbTuV7kUR6hQGwNjdnYFxxp5HBIG1b3YI2yy7ws_M",
    "3M_EOQcq_7XOfYClGXyQhyTYHC8Ckkdh71u0qpufowU",
    "xTRPNScE1asEjYzf4K3lQGVwvwaGBSQYHxAY4ein7Ig",
    "jhBgQKolMWzzxf92jS78W00ra3v88Gf2YToEJa9T9Kw",
  ])
    .toPromise()
    .catch((e) => e);
  //console.log(result);

  assert.equal(result["DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs"].total, 3);
  assert.equal(
    result["iXHbTuV7kUR6hQGwNjdnYFxxp5HBIG1b3YI2yy7ws_M"].vouched,
    2
  );
  assert.ok(true);
});

test.run();
