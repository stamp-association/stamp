import { test } from "uvu";
import * as assert from "uvu/assert";
import { times, always } from "ramda";

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

test("stamp as vouched user", async () => {
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
      id: createKey("z"),
      owner: JUSTIN,
      tags: [{ name: "Data-Source", value: CONTRACT2 }],
    },
    block: {
      height: 1111000,
      timestamp: Date.now(),
    },
  };

  const { handle } = await import("../src/index.js");
  const state = {
    balances: {
      [JUSTIN]: 2 * 1e12,
    },
    stamps: {},
    assets: {
      [CONTRACT2]: {
        balances: {
          [TOM]: 1,
        },
      },
    },
    vouchDAO: createKey("V"),
    lastReward: 1111000,
    pairs: [],
  };

  const action = {
    caller: JUSTIN,
    input: {
      function: "stamp",
      qty: 1 * 1e12,
    },
  };

  const result = await handle(state, action);

  console.log(JSON.stringify(result.state, null, 2));
  assert.equal(result.state.balances[TOM], 800000000000);
  assert.equal(result.state.stamps[`${CONTRACT2}:${JUSTIN}`].address, JUSTIN);
  assert.ok(true);

  globalThis.SmartWeave = {};
});

test.run();
