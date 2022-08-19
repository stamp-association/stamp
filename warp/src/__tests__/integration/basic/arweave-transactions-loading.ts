import fs from 'fs';

import ArLocal from 'arlocal';
import { JWKInterface } from 'arweave/node/lib/wallet';
import {
  ArweaveGatewayInteractionsLoader,
  Contract,
  DefaultEvaluationOptions,
  GQLNodeInterface,
  LexicographicalInteractionsSorter,
  LoggerFactory,
  Warp,
  WarpFactory
} from '@warp';
import path from 'path';
import { mineBlock } from '../_helpers';

let arlocal: ArLocal;
let warp: Warp;
let contract: Contract<ExampleContractState>;

interface ExampleContractState {
  counter: number;
}

describe('Testing the Arweave interactions loader', () => {
  let contractSrc: string;
  let wallet: JWKInterface;
  let loader: ArweaveGatewayInteractionsLoader;

  const evalOptions = new DefaultEvaluationOptions();
  let sorter: LexicographicalInteractionsSorter;
  let interactions: GQLNodeInterface[];

  beforeAll(async () => {
    LoggerFactory.INST.logLevel('error');
    // note: each tests suit (i.e. file with tests that Jest is running concurrently
    // with another files has to have ArLocal set to a different port!)
    arlocal = new ArLocal(1831, false);
    await arlocal.start();

    warp = WarpFactory.forLocal(1831);

    const { arweave } = warp;

    loader = new ArweaveGatewayInteractionsLoader(arweave);
    sorter = new LexicographicalInteractionsSorter(arweave);

    wallet = await warp.testing.generateWallet();

    contractSrc = fs.readFileSync(path.join(__dirname, '../data/inf-loop-contract.js'), 'utf8');
    const { contractTxId } = await warp.createContract.deploy({
      wallet,
      initState: JSON.stringify({
        counter: 10
      }),
      src: contractSrc
    });

    contract = warp
      .contract<ExampleContractState>(contractTxId)
      .setEvaluationOptions({
        maxInteractionEvaluationTimeSeconds: 1,
        mineArLocalBlocks: false
      })
      .connect(wallet);

    await mineBlock(warp);
  });

  afterAll(async () => {
    await arlocal.stop();
  });

  it('should add interactions on multiple blocks', async () => {
    await contract.writeInteraction({ function: 'add' });
    await contract.writeInteraction({ function: 'add' });
    await contract.writeInteraction({ function: 'add' });
    await contract.writeInteraction({ function: 'add' });
    await contract.writeInteraction({ function: 'add' });
    await mineBlock(warp);

    await contract.writeInteraction({ function: 'add' });
    await contract.writeInteraction({ function: 'add' });
    await contract.writeInteraction({ function: 'add' });
    await contract.writeInteraction({ function: 'add' });
    await contract.writeInteraction({ function: 'add' });
    await contract.writeInteraction({ function: 'add' });
    await contract.writeInteraction({ function: 'add' });
    await contract.writeInteraction({ function: 'add' });
    await contract.writeInteraction({ function: 'add' });
    await contract.writeInteraction({ function: 'add' });
    await mineBlock(warp);

    await contract.writeInteraction({ function: 'add' });
    await contract.writeInteraction({ function: 'add' });
    await contract.writeInteraction({ function: 'add' });
    await contract.writeInteraction({ function: 'add' });
    await contract.writeInteraction({ function: 'add' });
    await mineBlock(warp);
  });

  it('should load all interactions', async () => {
    interactions = await loader.load(contract.txId(), null, null, evalOptions);
    expect(interactions.length).toBe(20);
  });

  it('should return properly sorted interactions', async () => {
    const sorted = await sorter.sort(
      interactions.map((i) => ({
        node: i,
        cursor: null
      }))
    );

    for (let i = 0; i < interactions.length; i++) {
      const interaction = interactions[i];
      expect(sorted[i].node.sortKey).toEqual(interaction.sortKey);
    }
  });

  it('should properly limit results (0,1,2)', async () => {
    const interactions2 = await loader.load(contract.txId(), null, interactions[2].sortKey, evalOptions);
    expect(interactions2.length).toBe(3);

    expect(interactions2[0].sortKey).toEqual(interactions[0].sortKey);
    expect(interactions2[1].sortKey).toEqual(interactions[1].sortKey);
    expect(interactions2[2].sortKey).toEqual(interactions[2].sortKey);
  });

  it('should properly limit results (1,2)', async () => {
    const interactions2 = await loader.load(
      contract.txId(),
      interactions[0].sortKey,
      interactions[2].sortKey,
      evalOptions
    );
    expect(interactions2.length).toBe(2);

    expect(interactions2[0].sortKey).toEqual(interactions[1].sortKey);
    expect(interactions2[1].sortKey).toEqual(interactions[2].sortKey);
  });

  it('should properly limit results (3,4,5,6)', async () => {
    const interactions2 = await loader.load(
      contract.txId(),
      interactions[2].sortKey,
      interactions[6].sortKey,
      evalOptions
    );
    expect(interactions2.length).toBe(4);

    expect(interactions2[0].sortKey).toEqual(interactions[3].sortKey);
    expect(interactions2[1].sortKey).toEqual(interactions[4].sortKey);
    expect(interactions2[2].sortKey).toEqual(interactions[5].sortKey);
    expect(interactions2[3].sortKey).toEqual(interactions[6].sortKey);
  });

  it('should properly limit results (6,7,8,9)', async () => {
    const interactions2 = await loader.load(
      contract.txId(),
      interactions[5].sortKey,
      interactions[9].sortKey,
      evalOptions
    );
    expect(interactions2.length).toBe(4);

    expect(interactions2[0].sortKey).toEqual(interactions[6].sortKey);
    expect(interactions2[1].sortKey).toEqual(interactions[7].sortKey);
    expect(interactions2[2].sortKey).toEqual(interactions[8].sortKey);
    expect(interactions2[3].sortKey).toEqual(interactions[9].sortKey);
  });

  it('should properly limit results (6-19) - no upper bound', async () => {
    const interactions2 = await loader.load(contract.txId(), interactions[5].sortKey, null, evalOptions);
    expect(interactions2.length).toBe(14);

    expect(interactions2[0].sortKey).toEqual(interactions[6].sortKey);
    expect(interactions2[1].sortKey).toEqual(interactions[7].sortKey);
    expect(interactions2[2].sortKey).toEqual(interactions[8].sortKey);
    expect(interactions2[3].sortKey).toEqual(interactions[9].sortKey);
  });

  it('should properly limit results (2-11)', async () => {
    const interactions2 = await loader.load(
      contract.txId(),
      interactions[1].sortKey,
      interactions[11].sortKey,
      evalOptions
    );
    expect(interactions2.length).toBe(10);

    expect(interactions2[0].sortKey).toEqual(interactions[2].sortKey);
    expect(interactions2[0].block.height).toEqual(2);
    expect(interactions2[1].sortKey).toEqual(interactions[3].sortKey);
    expect(interactions2[1].block.height).toEqual(2);
    expect(interactions2[2].sortKey).toEqual(interactions[4].sortKey);
    expect(interactions2[2].block.height).toEqual(2);

    expect(interactions2[3].sortKey).toEqual(interactions[5].sortKey);
    expect(interactions2[3].block.height).toEqual(3);
    expect(interactions2[4].sortKey).toEqual(interactions[6].sortKey);
    expect(interactions2[4].block.height).toEqual(3);
    expect(interactions2[5].sortKey).toEqual(interactions[7].sortKey);
    expect(interactions2[5].block.height).toEqual(3);
    expect(interactions2[6].sortKey).toEqual(interactions[8].sortKey);
    expect(interactions2[6].block.height).toEqual(3);
    expect(interactions2[7].sortKey).toEqual(interactions[9].sortKey);
    expect(interactions2[7].block.height).toEqual(3);
    expect(interactions2[8].sortKey).toEqual(interactions[10].sortKey);
    expect(interactions2[8].block.height).toEqual(3);
    expect(interactions2[9].sortKey).toEqual(interactions[11].sortKey);
    expect(interactions2[9].block.height).toEqual(3);
  });

  it('should properly limit results (13-17)', async () => {
    const interactions2 = await loader.load(
      contract.txId(),
      interactions[12].sortKey,
      interactions[17].sortKey,
      evalOptions
    );
    expect(interactions2.length).toBe(5);

    expect(interactions2[0].sortKey).toEqual(interactions[13].sortKey);
    expect(interactions2[0].block.height).toEqual(3);
    expect(interactions2[1].sortKey).toEqual(interactions[14].sortKey);
    expect(interactions2[1].block.height).toEqual(3);

    expect(interactions2[2].sortKey).toEqual(interactions[15].sortKey);
    expect(interactions2[2].block.height).toEqual(4);
    expect(interactions2[3].sortKey).toEqual(interactions[16].sortKey);
    expect(interactions2[3].block.height).toEqual(4);
    expect(interactions2[4].sortKey).toEqual(interactions[17].sortKey);
    expect(interactions2[4].block.height).toEqual(4);
  });

  it('should properly limit results (13-17)', async () => {
    const interactions2 = await loader.load(
      contract.txId(),
      interactions[3].sortKey,
      interactions[17].sortKey,
      evalOptions
    );
    expect(interactions2.length).toBe(14);

    expect(interactions2[0].sortKey).toEqual(interactions[4].sortKey);
    expect(interactions2[0].block.height).toEqual(2);

    expect(interactions2[1].sortKey).toEqual(interactions[5].sortKey);
    expect(interactions2[1].block.height).toEqual(3);
    expect(interactions2[2].sortKey).toEqual(interactions[6].sortKey);
    expect(interactions2[2].block.height).toEqual(3);
    expect(interactions2[3].sortKey).toEqual(interactions[7].sortKey);
    expect(interactions2[3].block.height).toEqual(3);
    expect(interactions2[4].sortKey).toEqual(interactions[8].sortKey);
    expect(interactions2[4].block.height).toEqual(3);
    expect(interactions2[5].sortKey).toEqual(interactions[9].sortKey);
    expect(interactions2[5].block.height).toEqual(3);
    expect(interactions2[6].sortKey).toEqual(interactions[10].sortKey);
    expect(interactions2[6].block.height).toEqual(3);
    expect(interactions2[7].sortKey).toEqual(interactions[11].sortKey);
    expect(interactions2[7].block.height).toEqual(3);
    expect(interactions2[8].sortKey).toEqual(interactions[12].sortKey);
    expect(interactions2[8].block.height).toEqual(3);
    expect(interactions2[9].sortKey).toEqual(interactions[13].sortKey);
    expect(interactions2[9].block.height).toEqual(3);
    expect(interactions2[10].sortKey).toEqual(interactions[14].sortKey);
    expect(interactions2[10].block.height).toEqual(3);
    expect(interactions2[11].sortKey).toEqual(interactions[15].sortKey);

    expect(interactions2[11].block.height).toEqual(4);
    expect(interactions2[12].sortKey).toEqual(interactions[16].sortKey);
    expect(interactions2[12].block.height).toEqual(4);
    expect(interactions2[13].sortKey).toEqual(interactions[17].sortKey);
    expect(interactions2[13].block.height).toEqual(4);
  });
});
