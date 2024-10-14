import { test } from "uvu";
import * as assert from "uvu/assert";

import { counts } from "../src/lib/counts.js";

test("count stamps of multiple assets", async () => {
  const env = {
    aoDryRun: (tags) => {
      assert.equal(tags.find((tag) => tag.name == 'Data-Sources').value, JSON.stringify(["DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs", "iXHbTuV7kUR6hQGwNjdnYFxxp5HBIG1b3YI2yy7ws_M"]))
      return Promise.resolve({
        Messages: [{ 
          Tags: [{ name: 'Result', value: 'Success'}],
          Data: JSON.stringify({ 
            "DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs": [{'Vouched': 'true'}, {'Vouched': 'true'}, {'Vouched': 'true'}, {'Vouched': 'false'}, {'Vouched': 'false'}, {'Vouched': 'false'}],
            "iXHbTuV7kUR6hQGwNjdnYFxxp5HBIG1b3YI2yy7ws_M": [{'Vouched': 'true'}, {'Vouched': 'true'}, {'Vouched': 'false'}]
          })
        }]
      })
    }
  }
  const result = await counts(env, [
    "DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs",
    "iXHbTuV7kUR6hQGwNjdnYFxxp5HBIG1b3YI2yy7ws_M"
  ])
    .toPromise()
    .catch((e) => e)

  assert.equal(result["DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs"].total, 6);
  assert.equal(result["DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs"].vouched, 3);
  assert.equal(result["iXHbTuV7kUR6hQGwNjdnYFxxp5HBIG1b3YI2yy7ws_M"].total, 3);
  assert.equal(result["iXHbTuV7kUR6hQGwNjdnYFxxp5HBIG1b3YI2yy7ws_M"].vouched, 2);
});

test.run();
