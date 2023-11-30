import { test } from "uvu";
import * as assert from "uvu/assert";

import { hasStamped } from "../src/lib/has-stamped.js";

test("has-stamped only one tx", async () => {
  const env = {
    query: () =>
      Promise.resolve([
        { id: "kNprZ6kYnqiw9blunfmKO9KHRNM2IQJSASaKZ1Gd6dc", tags: [{ name: "Data-Source", value: "DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs" }] },
        { id: "rhG-N8LV6mYovVdThfDJgZC_a-zH46q55wgHCI6HKuM", tags: [{ name: "Data-Source", value: "DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs" }] },
      ]),
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
    query: () =>
      Promise.resolve([
      ]),
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
    query: () =>
      Promise.resolve([
        { id: "kNprZ6kYnqiw9blunfmKO9KHRNM2IQJSASaKZ1Gd6dc", tags: [{ name: "Data-Source", value: "DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTb" }] },
        { id: "rhG-N8LV6mYovVdThfDJgZC_a-zH46q55wgHCI6HKuM", tags: [{ name: "Data-Source", value: "DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs" }] },
      ]),
    getAddress: () =>
      Promise.resolve("vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI"),
  };
  const result = await hasStamped(
    env,
    ["DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTb", "DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs", "ABC"]
  ).toPromise();

  assert.equal(result, {
    'DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTb': true,
    'DU9OfvVtCiu-NFniKuGULgCWBQJdDIpVhcF8hnULFTs': true,
    "ABC": false
  })
  //assert.ok(result.length === 2);
})


test.run();
