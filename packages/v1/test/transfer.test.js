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
  const map = new Map();
  globalThis.SmartWeave = {
    kv: {
      get: (k) => Promise.resolve(map.get(k)),
      put: (k, v) => Promise.resolve(map.set(k, v)),
    },
  };
  const STAMP = 1 * 1e12;
  map.set(TOM, 5 * STAMP);
  const { handle } = await import("../src/index.js");
  const result = await handle(
    {},
    {
      caller: TOM,
      input: { function: "transfer", qty: 5 * STAMP, target: JUSTIN },
    }
  );
  assert.equal(map.get(JUSTIN), 5 * STAMP);
});

test("should transfer half", async () => {
  const map = new Map();
  globalThis.SmartWeave = {
    kv: {
      get: (k) => Promise.resolve(map.get(k)),
      put: (k, v) => Promise.resolve(map.set(k, v)),
    },
  };
  const STAMP = 1 * 1e12;
  map.set(TOM, 4 * STAMP);
  const { handle } = await import("../src/index.js");
  const result = await handle(
    {},
    {
      caller: TOM,
      input: { function: "transfer", qty: 2 * STAMP, target: JUSTIN },
    }
  );
  assert.equal(map.get(JUSTIN), 2 * STAMP);
});

test("should not transfer if caller has no balance", async () => {
  const map = new Map();
  globalThis.SmartWeave = {
    kv: {
      get: (k) => Promise.resolve(map.get(k)),
      put: (k, v) => Promise.resolve(map.set(k, v)),
    },
  };
  const STAMP = 1 * 1e12;
  //map.set(TOM, 4 * STAMP)
  const { handle } = await import("../src/index.js");

  try {
    await handle(
      {},
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
  const map = new Map();
  globalThis.SmartWeave = {
    kv: {
      get: (k) => Promise.resolve(map.get(k)),
      put: (k, v) => Promise.resolve(map.set(k, v)),
    },
  };
  const STAMP = 1 * 1e12;
  const { handle } = await import("../src/index.js");
  try {
    await handle(
      {},
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
  const map = new Map();
  globalThis.SmartWeave = {
    kv: {
      get: (k) => Promise.resolve(map.get(k)),
      put: (k, v) => Promise.resolve(map.set(k, v)),
    },
  };
  const STAMP = 1 * 1e12;
  const { handle } = await import("../src/index.js");
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

test.run();
