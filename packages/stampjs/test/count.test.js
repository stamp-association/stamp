import { test } from "uvu";
import * as assert from "uvu/assert";

import { count } from "../src/lib/count.js";
import svcs from "../src/svcs/index.js";

test("ok", async () => {
  const env = {
    query: svcs.query,
    vouchedServices: svcs.vouchServices,
  };
  const result = await count(
    env,
    "DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs"
  ).toPromise();
  console.log(result);
  assert.ok(true);
});

test.run();
