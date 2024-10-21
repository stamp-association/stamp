import { test } from "uvu";
import * as assert from "uvu/assert";
import { WarpFactory, LoggerFactory } from "warp-contracts/mjs";
import Arweave from "arweave";
import Stamps from "../src/index.js";

LoggerFactory.INST.logLevel("fatal");
const arweave = Arweave.init({});
const warp = WarpFactory.forMainnet();
const stamps = Stamps.init({ warp });

global.arweaveWallet = {
  sign: async (tx) => {
    const jwk = await arweave.wallets.generate();
    await arweave.transactions.sign(tx, jwk);
    return tx;
  },
};

globalThis.window = { location: { hostname: "tom.g8way.io" } };

test("init stampjs", () => {
  const _stamps = Stamps.init({ warp });

  assert.ok(_stamps.stamp);
});

test.skip("init stampjs - warp is required!", () => {
  try {
    const _stamps = Stamps.init({});
    assert.ok(false);
  } catch (e) {
    assert.equal(e.message, "warp instance is required for stampjs");
    assert.ok(true);
  }
});

test.skip("filter fn should return stamps", async () => {
  const result = await stamps.filter([
    "compose",
    ["length"],
    ["filter", ["propEq", "flagged", false]],
    ["values"],
    ["prop", "stamps"],
  ]);

  assert.ok(result > 1);
});

test.run();
