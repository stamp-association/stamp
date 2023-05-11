import { test } from "uvu";
import * as assert from "uvu/assert";

import { times, always } from "ramda";

const createKey = (c) => times(always(c), 43).join("");

const CONTRACT = createKey("A");
const CONTRACT2 = createKey("B");
const TOM = createKey("X");
const JUSTIN = createKey("Y");

test("process credits", async () => {
  // global state
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

  // state
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
    credits: {
      1110999: [
        {
          holder: TOM,
          qty: 1 * 1e12,
          asset: CONTRACT,
        },
      ],
    },
  };
  // action
  const action = {
    caller: TOM,
    input: {
      function: "stamp",
    },
  };
  const { handle } = await import("../src/index.js");
  const result = await handle(state, action);
  // assert
  assert.equal(result.state.balances[TOM], 1 * 1e12);
  assert.equal(result.state.credits, {});
  assert.ok(true);

  globalThis.SmartWeave = {};
});

test.run();
