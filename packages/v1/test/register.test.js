import { test } from "uvu";
import * as assert from "uvu/assert";
import { times, always, view, lensPath } from "ramda";

const createKey = (c) => times(always(c), 43).join("");

const CONTRACT = createKey("A");
const CONTRACT2 = createKey("B");
const TOM = createKey("X");
const JUSTIN = createKey("Y");

class ContractError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ContractError";
  }
}

globalThis.ContractError = ContractError;

test("register this transaction", async () => {
  const ASSET = createKey("z");
  globalThis.SmartWeave = {
    contracts: {
      readContractState: (contractId) =>
        contractId === CONTRACT
          ? Promise.reject("Not Found")
          : Promise.resolve({
              vouched: {
                [TOM]: [
                  { service: "Ax_uXyLQBPZSQ15movzv9-O1mDo30khslqN64qD27Z8" },
                ],
                [JUSTIN]: [
                  { service: "Ax_uXyLQBPZSQ15movzv9-O1mDo30khslqN64qD27Z8" },
                ],
              },
            }),
    },
    transaction: {
      id: ASSET,
      owner: JUSTIN,
      tags: [],
    },
    block: {
      height: 1111000,
      timestamp: Date.now(),
    },
  };

  const { handle } = await import("../src/index.js");
  const state = {
    balances: {},
    stamps: {},
    assets: {},
    vouchDAO: createKey("V"),
    lastReward: 1111000,
    pairs: [],
  };

  const action = {
    caller: JUSTIN,
    input: {
      function: "register",
    },
  };

  const result = await handle(state, action);
  assert.equal(
    view(lensPath(["state", "assets", ASSET, "balances", JUSTIN]), result),
    1
  );

  globalThis.SmartWeave = {};
});

test("register this transaction", async () => {
  const ASSET = createKey("z");
  globalThis.SmartWeave = {
    contracts: {
      readContractState: (contractId) =>
        contractId === CONTRACT
          ? Promise.reject("Not Found")
          : Promise.resolve({
              vouched: {
                [TOM]: [
                  { service: "Ax_uXyLQBPZSQ15movzv9-O1mDo30khslqN64qD27Z8" },
                ],
                [JUSTIN]: [
                  { service: "Ax_uXyLQBPZSQ15movzv9-O1mDo30khslqN64qD27Z8" },
                ],
              },
            }),
    },
    transaction: {
      id: ASSET,
      owner: JUSTIN,
      tags: [],
    },
    block: {
      height: 1111000,
      timestamp: Date.now(),
    },
  };

  const { handle } = await import("../src/index.js");
  const state = {
    balances: {},
    stamps: {},
    assets: {},
    vouchDAO: createKey("V"),
    lastReward: 1111000,
    pairs: [],
  };

  const action = {
    caller: JUSTIN,
    input: {
      function: "register",
    },
  };

  const result = await handle(state, action);
  assert.equal(
    view(lensPath(["state", "assets", ASSET, "balances", JUSTIN]), result),
    1
  );

  globalThis.SmartWeave = {};
});

test.run();
