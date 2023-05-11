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
  const state = {
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

  assert.equal(map.get(JUSTIN), 1 * 1e12);
  assert.equal(result.state.claimable, []);
  assert.ok(true);

  globalThis.SmartWeave = {};
});

test.run();
