import { test } from "uvu";
import * as assert from "uvu/assert";
import { stamp } from "../src/lib/stamp.js";

test("stamp atomic asset", async () => {
  const env = {
    writeInteraction: (tags) => {
      assert.equal(tags.find((tag) => tag.name == 'Action').value, 'Write-Stamp')
      assert.equal(tags.find((tag) => tag.name == 'Data-Source').value, 'zTzNGkPyOevCRdwiyBiMI35fpQmsdt8N1ckK_iE2aA0')
      assert.equal(tags.find((tag) => tag.name == 'Super-Stamp-Quantity').value, '0')
      return Promise.resolve('tx')
    },
    readInteraction: (tx) => {
      return Promise.resolve(tx)
    },
    getAddress: () =>
      Promise.resolve("vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI"),
  };

  const result = await stamp(
    env,
    "zTzNGkPyOevCRdwiyBiMI35fpQmsdt8N1ckK_iE2aA0"
  ).toPromise();

  assert.ok(true);
});

test("superstamp atomic asset", async () => {
  const env = {
    writeInteraction: (tags) => {
      assert.equal(tags.find((tag) => tag.name == 'Action').value, 'Write-Stamp')
      assert.equal(tags.find((tag) => tag.name == 'Data-Source').value, 'zTzNGkPyOevCRdwiyBiMI35fpQmsdt8N1ckK_iE2aA0')
      assert.equal(tags.find((tag) => tag.name == 'Super-Stamp-Quantity').value, '100')
      return Promise.resolve('tx')
    },
    readInteraction: (tx) => {
      return Promise.resolve(tx)
    },
    getAddress: () =>
      Promise.resolve("vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI"),
  };

  const result = await stamp(
    env,
    "zTzNGkPyOevCRdwiyBiMI35fpQmsdt8N1ckK_iE2aA0",
    100
  ).toPromise();

  assert.ok(true);
});

test.run();
