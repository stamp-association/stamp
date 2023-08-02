import { test } from "uvu";
import * as assert from "uvu/assert";
import { balance } from "../src/lib/balance.js";

test("get balance", async () => {
  const result = await balance({
    viewState: (address) => Promise.resolve({ target: address, balance: 1 })
  }, 'vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI').toPromise();

  assert.equal(result, 1);
});

test.run();
