import { test } from "uvu";
import * as assert from "uvu/assert";

import { hasStamped } from "../src/lib/has-stamped.js";

test("ok", async () => {
  const env = {
    query: () =>
      Promise.resolve([
        { id: "kNprZ6kYnqiw9blunfmKO9KHRNM2IQJSASaKZ1Gd6dc" },
        { id: "rhG-N8LV6mYovVdThfDJgZC_a-zH46q55wgHCI6HKuM" },
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

test.run();
