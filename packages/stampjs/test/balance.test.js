import { test } from "uvu";
import * as assert from "uvu/assert";
import { balance } from "../src/lib/balance.js";
import { aoDryRun } from "../src/svcs/ao.js"

test("get balance", async () => {
  const result = await balance({
    aoDryRun: (tags) => {
      assert.equal(tags.find((tag) => tag.name == 'Recipient').value, 'vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI')
      return Promise.resolve({
        Messages: [{ 
          Tags: [{ name: 'Result', value: 'Success '}],
          Data: 1
        }]
      })
    }
  }, 'vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI').toPromise();

  assert.equal(result, 1);
});

test.run();
