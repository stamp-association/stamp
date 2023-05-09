import { test } from "uvu";
import * as assert from "uvu/assert";
import { path, times, always } from "ramda";

import { handle } from "../src/index.js";

class ContractError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ContractError";
  }
}

globalThis.ContractError = ContractError;
globalThis.SmartWeave = {};

const TOM = times(always("X"), 43).join("");
const JUSTIN = times(always("Y"), 43).join("");
test.skip("should throw function not found", async () => {
  assert.throws([{ caller: TOM, input: {} }].reduce(handle, {}));
});

test("should transfer ownership", async () => {
  const STAMP = 1 * 1e6;
  const result = await [
    {
      caller: TOM,
      input: { function: "transfer", qty: 5 * STAMP, target: JUSTIN },
    },
  ].reduce(handle, { balances: { [TOM]: 5 * STAMP } });
  assert.equal(path(["state", "balances", JUSTIN], result), 5 * STAMP);
});

test("should transfer half", async () => {
  const STAMP = 1 * 1e6;
  const result = await [
    {
      caller: TOM,
      input: { function: "transfer", qty: 2 * STAMP, target: JUSTIN },
    },
  ].reduce(handle, { balances: { [TOM]: 4 * STAMP } });
  assert.equal(path(["state", "balances", JUSTIN], result), 2 * STAMP);
});

test("should not transfer if caller has no balance", async () => {
  const STAMP = 1 * 1e6;
  try {
    await [
      {
        caller: TOM,
        input: { function: "transfer", qty: 2 * STAMP, target: JUSTIN },
      },
    ].reduce(handle, { balances: {} });
  } catch (e) {
    assert.equal(e.message, "not enough balance to transfer");
  }
});

test("caller can not be target", async () => {
  const STAMP = 1 * 1e6;
  try {
    await handle(
      { balances: {} },
      {
        caller: TOM,
        input: { function: "transfer", qty: 2 * STAMP, target: TOM },
      }
    );
  } catch (e) {
    assert.equal(e.message, "target cannot be caller");
  }
});

test("qty must be an integer", async () => {
  const STAMP = 1 * 1e6;
  try {
    await handle(
      {},
      {
        caller: TOM,
        input: { function: "transfer", target: JUSTIN, qty: "10000" },
      }
    );
  } catch (e) {
    assert.equal(e.message, "qty is not defined or is not a number");
  }
});

// test('qty can be big number', async () => {
//   const STAMP = 1 * 1e12
//   //const 1M_STAMPS = 1000000 * STAMP
//   try {
//     await handle({ balances: {} }, { caller: TOM, input: { function: 'transfer', target: JUSTIN, qty: STAMP } })
//   } catch (e) {
//     assert.equal(e.message, 'qty is not defined or is not a number')
//   }
// })

test.run();
