import { test } from "uvu";
import * as assert from "uvu/assert";
import fs from "fs";
import { stamp } from "../src/lib/stamp.js";
import svcs from "../src/svcs/index.js";
import Arweave from "arweave";
//import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'
import { WarpFactory, LoggerFactory } from "warp-contracts";

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});
LoggerFactory.INST.logLevel("debug");
const warp = WarpFactory.forMainnet();
const wallet = JSON.parse(fs.readFileSync('./wallet.json'))
// global.arweaveWallet = {
//   sign: async (tx) => {
//     const jwk = JSON.parse(fs.readFileSync('../../wallet.json'))
//     await arweave.transactions.sign(tx, jwk);
//     return tx;
//   },
// };

test("stamp atomic asset", async () => {
  const env = {
    writeInteraction: svcs.writeInteraction(
      warp,
      "TlqASNDLA1Uh8yFiH-BzR_1FDag4s735F3PoUFEv2Mo",
      wallet 
    ),
    getState: svcs.getState("https://dre-4.warp.cc/contract"),
    vouchServices: svcs.vouchServices,
    query: svcs.query,
    getAddress: () =>
      Promise.resolve("vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI"),
    dispatch: () => Promise.resolve({ ok: true }),
  };

  const result = await stamp(
    env,
    "zTzNGkPyOevCRdwiyBiMI35fpQmsdt8N1ckK_iE2aA0"
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
