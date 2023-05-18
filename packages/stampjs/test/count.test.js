import { test } from "uvu";
import * as assert from "uvu/assert";

import { count } from "../src/lib/count.js";
import svcs from "../src/svcs/index.js";

test("ok", async () => {
  const env = {
    query: svcs.query,
    vouchServices: svcs.vouchServices,
  };
  const result = await count(
    env,
    "DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs"
  ).toPromise();
  assert.equal(result.total, 3);
  assert.equal(result.vouched, 3);
  assert.ok(true);
});

test("ok", async () => {
  const env = {
    query: svcs.query,
    vouchServices: svcs.vouchServices,
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
