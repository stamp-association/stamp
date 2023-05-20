import { test } from "uvu";
import * as assert from "uvu/assert";
import { path, times, always } from "ramda";

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
  const STAMP = 1 * 1e12;
  const { handle } = await import("../src/index.js");
  const result = await handle(
    {
      balances: { [TOM]: 5 * STAMP },
    },
    {
      caller: TOM,
      input: { function: "transfer", qty: 5 * STAMP, target: JUSTIN },
    }
  );
  assert.equal(result.state.balances[JUSTIN], 5 * STAMP);
});

test("should transfer half", async () => {
  const STAMP = 1 * 1e12;
  const { handle } = await import("../src/index.js");
  const result = await handle(
    {
      balances: { [TOM]: 4 * STAMP },
    },
    {
      caller: TOM,
      input: { function: "transfer", qty: 2 * STAMP, target: JUSTIN },
    }
  );
  assert.equal(result.state.balances[JUSTIN], 2 * STAMP);
});

test("should not transfer if caller has no balance", async () => {
  const STAMP = 1 * 1e12;
  const { handle } = await import("../src/index.js");

  try {
    await handle(
      { balances: {} },
      {
        caller: TOM,
        input: { function: "transfer", qty: 2 * STAMP, target: JUSTIN },
      }
    );
  } catch (e) {
    assert.equal(e.message, "not enough balance to transfer");
  }
});

test("caller can not be target", async () => {
  const STAMP = 1 * 1e12;
  const { handle } = await import("../src/index.js");
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
  const STAMP = 1 * 1e12;
  const { handle } = await import("../src/index.js");
  try {
    await handle(
      { balances: {} },
      {
        caller: TOM,
        input: { function: "transfer", target: JUSTIN, qty: "10000" },
      }
    );
  } catch (e) {
    assert.equal(e.message, "qty is not defined or is not a number");
  }
});

test.run();
