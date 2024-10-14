import { test } from "uvu";
import * as assert from "uvu/assert";

import { count } from "../src/lib/count.js";
import fs from "fs";

test("count stamps of asset", async () => {
  const env = {
    aoDryRun: (tags) => {
      assert.equal(tags.find((tag) => tag.name == 'Data-Source').value, "DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs")
      return Promise.resolve({
        Messages: [{ 
          Tags: [{ name: 'Result', value: 'Success '}],
          Data: JSON.stringify({ stampsByAsset: [{'Vouched': 'true'}, {'Vouched': 'true'}, {'Vouched': 'true'}, {'Vouched': 'false'}, {'Vouched': 'false'}, {'Vouched': 'false'}]})
        }]
     })
    }
  };
  const result = await count(
    env,
    "DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs"
  ).toPromise();

  assert.equal(result.total, 6);
  assert.equal(result.vouched, 3);
})

test.run()