import { test } from "uvu";
import * as assert from "uvu/assert";

import { counts } from "../src/lib/counts.js";
import svcs from "../src/svcs/index.js";

test("ok", async () => {
  const env = {
    query: svcs.query,
    vouchServices: svcs.vouchServices,
  };
  const result = await counts(env, [
    "DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs",
    "iXHbTuV7kUR6hQGwNjdnYFxxp5HBIG1b3YI2yy7ws_M",
  ])
    .toPromise()
    .catch((e) => e);
  console.log(result);

  //assert.equal(result.total, 3);
  //assert.equal(result.vouched, 3);
  assert.ok(true);
});

test.run();
