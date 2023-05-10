import { test } from "uvu";
import * as assert from "uvu/assert";
import { times, always, view, lensPath } from "ramda";

const createKey = (n) => times(always(n), 43).join("");
const TOM = createKey("X");
const JUSTIN = createKey("Y");

class ContractError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ContractError";
  }
}

globalThis.ContractError = ContractError;

test("handle rewards", async () => {
  globalThis.SmartWeave = {
    contracts: {
      readContractState: (id) =>
        id === createKey("V")
          ? Promise.resolve({
              vouched: {
                [TOM]: [
                  { service: "Ax_uXyLQBPZSQ15movzv9-O1mDo30khslqN64qD27Z8" },
                ],
                [JUSTIN]: [
                  { service: "Ax_uXyLQBPZSQ15movzv9-O1mDo30khslqN64qD27Z8" },
                ],
              },
            })
          : id === createKey("A")
          ? Promise.resolve({ balances: { [JUSTIN]: 1 } })
          : Promise.reject("Not Found: " + id),
    },
    block: {
      height: 2000,
      timestamp: Date.now(),
    },
    transaction: {
      id: createKey("M"),
      owner: TOM,
      tags: [{ name: "Data-Source", value: createKey("D") }],
    },
    contract: {
      id: createKey("S"),
    },
  };
  const state = {
    balances: {},
    stamps: {
      [`${createKey("C")}:${TOM}`]: { asset: createKey("C"), address: TOM },
      [`${createKey("C")}:${JUSTIN}`]: {
        asset: createKey("C"),
        address: JUSTIN,
      },
      [`${createKey("A")}:${TOM}`]: { asset: createKey("A"), address: TOM },
      [`${createKey("F")}:${JUSTIN}`]: {
        asset: createKey("F"),
        address: JUSTIN,
      },
    },
    assets: {
      [createKey("C")]: { balances: { [TOM]: 5, [JUSTIN]: 5 } },
      [createKey("D")]: { balances: { [TOM]: 1 } },
    },
    vouchDAO: createKey("V"),
    lastReward: 1000,
  };
  const action = {
    input: {
      function: "stamp",
    },
    caller: TOM,
  };
  const { handle } = await import("../src/index.js");
  const result = await handle(state, action);
  assert.equal(view(lensPath(["state", "balances", TOM]), result), 250 * 1e6);
  assert.equal(
    view(lensPath(["state", "balances", JUSTIN]), result),
    250 * 1e6
  );
  assert.ok(true);
});

test.run();
