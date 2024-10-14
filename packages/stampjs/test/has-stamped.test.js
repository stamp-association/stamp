import { test } from "uvu";
import * as assert from "uvu/assert";

import { hasStamped } from "../src/lib/has-stamped.js";

test("has-stamped only one tx", async () => {
  const env = {
    aoDryRun: (tags) => {
      assert.equal(tags.find((tag) => tag.name == 'Data-Source').value, "vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI")
      return Promise.resolve({
        Messages: [{ 
          Tags: [{ name: 'Result', value: 'Success'}],
          Data: JSON.stringify({ 
            stampsByAddress: [{ Asset: "DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs"}, { Asset: 'foo'}, { Asset: 'bar' }]
          })
        }]
      })
    },
    getAddress: () =>
      Promise.resolve("vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI"),
  };
  const result = await hasStamped(
    env,
    "DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs"
  ).toPromise();

  assert.ok(result);
});

test("has-stamped should be false", async () => {
  const env = {
    aoDryRun: (tags) => {
      assert.equal(tags.find((tag) => tag.name == 'Data-Source').value, "vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI")
      return Promise.resolve({
        Messages: [{ 
          Tags: [{ name: 'Result', value: 'Success'}],
          Data: JSON.stringify({ 
            stampsByAddress: [{ Asset: 'foo'}, { Asset: 'bar' }]
          })
        }]
      })
    },
    getAddress: () =>
      Promise.resolve("vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI"),
  };
  const result = await hasStamped(
    env,
    "DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs"
  ).toPromise();

  assert.ok(result === false);
});

test("has-stamped multiple txs", async () => {
  const env = {
    aoDryRun: (tags) => {
      assert.equal(tags.find((tag) => tag.name == 'Data-Source').value, "vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI")
      return Promise.resolve({
        Messages: [{ 
          Tags: [{ name: 'Result', value: 'Success'}],
          Data: JSON.stringify({ 
            stampsByAddress: [{ Asset: "DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs"}, { Asset: 'foo'}, { Asset: 'bar' }]
          })
        }]
      })
    },
    getAddress: () =>
      Promise.resolve("vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI"),
  };
  const result = await hasStamped(
    env,
    ["DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs", "foo", "ABC"]
  ).toPromise();

  assert.ok(Object.keys(result).length === 3);
  assert.equal(result, {
    'DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs': true,
    'foo': true,
    "ABC": false
  })
})


test.run();
