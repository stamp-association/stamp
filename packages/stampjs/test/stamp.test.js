import { test } from "uvu";
import * as assert from "uvu/assert";
import fs from "fs";
import { stamp } from "../src/lib/stamp.js";
import svcs from "../src/svcs/index.js";
import Arweave from "arweave";
import { WarpFactory, LoggerFactory } from "warp-contracts";

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});
LoggerFactory.INST.logLevel("debug");
const warp = WarpFactory.forMainnet();

// global.arweaveWallet = {
//   sign: async (tx) => {
//     const jwk = JSON.parse(fs.readFileSync('../../wallet.json'))
//     await arweave.transactions.sign(tx, jwk);
//     return tx;
//   },
// };

test("ok", async () => {
  const env = {
    writeInteraction: svcs.writeInteraction(
      warp,
      "ojTjHgoDUTzDMtXn-JVn2rIMgvpcvA8QdNfyCEoUanE"
    ),
    getState: svcs.getState("https://dre-1.warp.cc/contract"),
  };

  const result = await stamp(
    env,
    "Jtxi0ylRthPKnVld7NWWpun3ffHu3lFc1cTgifxqnT4"
  ).toPromise();
  console.log(result);
  assert.ok(true);

  /*
  const jwk = JSON.parse(fs.readFileSync('../../wallet.json'))

  const result = await warp.contract('ojTjHgoDUTzDMtXn-JVn2rIMgvpcvA8QdNfyCEoUanE')
    .connect(jwk)
    //.viewState({ function: 'balance' })
    // .setEvaluationOptions({
    //   allowBigInt: true,
    //   unsafeClient: 'skip',
    //   remoteStateSyncEnabled: true,
    //   useConstructor: true,
    //   useKVStorage: true
    // })
    .writeInteraction({ function: 'stamp' },
      {
        tags: [
          { name: 'Data-Source', value: 'Jtxi0ylRthPKnVld7NWWpun3ffHu3lFc1cTgifxqnT4' },
          { name: 'Protocol-Name', value: 'Stamp' }
        ]
      })
  console.log(result)
  assert.ok(true)
  */
});

test.run();
