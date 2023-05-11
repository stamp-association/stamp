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
const DEX = createKey("Y");

test("add balance to claimable state", async () => {
  const map = new Map();
  globalThis.SmartWeave = {
    transaction: {
      id: createKey("Z"),
    },
    contract: {
      id: createKey("S"),
    },
    kv: {
      get: (k) => Promise.resolve(map.get(k)),
      put: (k, v) => Promise.resolve(map.set(k, v)),
    },
  };
  map.set(TOM, 10 * 1e12);

  const state = {};
  const action = {
    caller: TOM,
    input: {
      function: "allow",
      qty: 1 * 1e12,
      target: DEX,
    },
  };

  const { handle } = await import("../src/index.js");
  const result = await handle(state, action);

  assert.equal(map.get(TOM), 9 * 1e12);
  assert.equal(result.state.claimable[0].qty, 1000000000000);
  assert.ok(true);

  globalThis.SmartWeave = {};
});

test.run();
