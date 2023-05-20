import { test } from "uvu";
import * as assert from "uvu/assert";

import { getSubdomain } from "../src/utils.js";

test.skip("get subdomains", () => {
  assert.equal(getSubdomain("tom.g8way.io"), "tom");
  assert.equal(getSubdomain("guide_stamps.arweave.dev"), "stamps");
  assert.equal(getSubdomain("arweave.net"), "");
});

test.run();
