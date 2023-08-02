import { test } from "uvu";
import * as assert from "uvu/assert";

import { count } from "../src/lib/count.js";
import svcs from "../src/svcs/index.js";
import fs from "fs";

const query1Result = JSON.parse(
  fs.readFileSync("./test/fixtures/count-test1-query2.json", "utf-8")
);
const query0Result = JSON.parse(
  fs.readFileSync("./test/fixtures/count-test1-query1.json", "utf-8")
);
const bundlrResult = JSON.parse(
  fs.readFileSync("./test/fixtures/bundlr0.json", "utf-8")
)

test("ok", async () => {
  let x = 0;
  const env = {
    query: async (...args) => {
      if (x === 0) {
        x = 1;
        return Promise.resolve(query0Result);
      } else {
        return Promise.resolve(query1Result);
      }
    },
    vouchServices: () => {
      return Promise.resolve([
        "Ax_uXyLQBPZSQ15movzv9-O1mDo30khslqN64qD27Z8",
        "jk0aaivTdKvzeLB_RhpC_ZUoy9CnY2trlEuHQVXulDQ",
      ]);
    },
    bundlr: () => Promise.resolve(bundlrResult)
  };
  const result = await count(
    env,
    "DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs"
  ).toPromise();
  assert.equal(result.total, 6);
  assert.equal(result.vouched, 3);
  assert.ok(true);
});

test.skip("ok", async () => {
  const env = {
    query: (...args) => {
      return svcs.query(...args);
    },
    vouchServices: () => {
      return Promise.resolve([
        "Ax_uXyLQBPZSQ15movzv9-O1mDo30khslqN64qD27Z8",
        "jk0aaivTdKvzeLB_RhpC_ZUoy9CnY2trlEuHQVXulDQ",
      ]);
    },
  };
  const result = await count(
    env,
    "jhBgQKolMWzzxf92jS78W00ra3v88Gf2YToEJa9T9Kw"
  ).toPromise();
  assert.equal(result.total, 5);
  assert.equal(result.vouched, 2);
  assert.ok(true);
});

test.run();
