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
/*
test('stamp asset', async () => {
  const result = await stamps.stamp('KhZ7qIAxOr4nMHT2Jh6kKjrrK_17aGFbXRaO7X6FI5o')
  console.log('stamp result', result.originalTxId)
  assert.ok(true)
})
*/
/*
test('stamp asset with a tag', async () => {
  const result = await stamps.stamp('M4sru2azaPEY-zOViXhCtfygFpvBy7C0ir8iOnrgRdA', 0, [{ name: 'test', value: 'test' }])
  console.log('stamp with test tag', result.originalTxId)
  assert.ok(true)
})


test('stamp asset with qty', async () => {
  try {
    const result = await stamps.stamp('KhZ7qIAxOr4nMHT2Jh6kKjrrK_17aGFbXRaO7X6FI5o', 1, [{ name: 'test', value: 'test' }])
    console.log('stamp with test tag', result.originalTxId)
  } catch (e) {
    assert.equal(e.message, 'Cannot create interaction: Not enough tokens to SuperStamp!')
  }
})

test('stamp asset with string for qty should error', async () => {
  try {
    const result = await stamps.stamp('KhZ7qIAxOr4nMHT2Jh6kKjrrK_17aGFbXRaO7X6FI5o', '1', [{ name: 'test', value: 'test' }])
    console.log('stamp with test tag', result.originalTxId)
  } catch (e) {
    assert.equal(e.message, 'Error: qty must be a integer!')
  }
})

test('stamp count', async () => {
  const result = await stamps.count('clvfYpvsdMNkMz2JeqEYzDTTcxEEJctv3sccMsyG7RA')
  assert.equal(10, result.total)
})

test('stamp counts', async () => {
  const result = await stamps.counts([
    'oHB-hYNKHOSqWrxJjroXZatSEmmFYpdKpoGTXNqvSo8',
    'clvfYpvsdMNkMz2JeqEYzDTTcxEEJctv3sccMsyG7RA'])
  assert.equal(10, result['clvfYpvsdMNkMz2JeqEYzDTTcxEEJctv3sccMsyG7RA'].total)
})

test('stamp token balance', async () => {
  const result = await stamps.balance('vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI')
  assert.ok(true)
})


test('check if user has stamped', async () => {
  const stamped = await stamps.hasStamped('vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI', 'clvfYpvsdMNkMz2JeqEYzDTTcxEEJctv3sccMsyG7RA')
  assert.ok(stamped)
})
*/

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
