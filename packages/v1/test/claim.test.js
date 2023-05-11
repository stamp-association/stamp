import { test } from "uvu";
import * as assert from "uvu/assert";
import { times, always } from "ramda";

const createKey = (c) => times(always(c), 43).join("");

class ContractError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ContractError";
  }
}

globalThis.ContractError = ContractError;

const TOM = createKey("X");
const JUSTIN = createKey("Y");

test("claim claimable trx", async () => {
  globalThis.SmartWeave = {
    transaction: {
      id: createKey("Z"),
    },
    contract: {
      id: createKey("S"),
    },
  };
  const state = {
    balances: {
      [TOM]: 10 * 1e12,
    },
    claimable: [
      {
        txID: createKey("O"),
        qty: 1 * 1e12,
        to: JUSTIN,
        from: TOM,
      },
    ],
  };
  const action = {
    caller: JUSTIN,
    input: {
      function: "claim",
      qty: 1 * 1e12,
      txID: createKey("O"),
    },
  };

  const { handle } = await import("../src/index.js");
  const result = await handle(state, action);

  assert.equal(result.state.claimable, []);
  assert.equal(result.state.balances[JUSTIN], 1 * 1e12);

  assert.ok(true);

  globalThis.SmartWeave = {};
});

test.run();
