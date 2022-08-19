import fs from 'fs';

import ArLocal from 'arlocal';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { Contract, LoggerFactory, Warp, WarpFactory } from '@warp';
import path from 'path';
import { mineBlock } from '../_helpers';

interface ExampleContractState {
  counter: number;
}

/**
 * This integration test should verify whether the basic functions of the Warp client
 * work properly.
 * It first deploys the new contract and verifies its initial state.
 * Then it subsequently creates new interactions - to verify, whether
 * the default caching mechanism (ie. interactions cache, state cache, etc).
 * work properly (ie. they do download the not yet cached interactions and evaluate state
 * for them).
 */
describe('Testing the Warp client', () => {
  let contractSrc: string;
  let initialState: string;

  let wallet: JWKInterface;

  let arlocal: ArLocal;
  let warp: Warp;
  let contract: Contract<ExampleContractState>;
  let contractInitData: Contract<ExampleContractState>;
  let contractVM: Contract<ExampleContractState>;

  beforeAll(async () => {
    // note: each tests suit (i.e. file with tests that Jest is running concurrently
    // with another files has to have ArLocal set to a different port!)
    arlocal = new ArLocal(1810, false);
    await arlocal.start();

    LoggerFactory.INST.logLevel('error');
    warp = WarpFactory.forLocal(1810);
    wallet = await warp.testing.generateWallet();

    contractSrc = fs.readFileSync(path.join(__dirname, '../data/example-contract.js'), 'utf8');
    initialState = fs.readFileSync(path.join(__dirname, '../data/example-contract-state.json'), 'utf8');

    // deploying contract using the new SDK.
    const { contractTxId } = await warp.createContract.deploy({
      wallet,
      initState: initialState,
      src: contractSrc
    });

    const { contractTxId: contractInitDataTxId } = await warp.createContract.deploy({
      wallet,
      initState: initialState,
      data: { 'Content-Type': 'text/html', body: '<h1>HELLO WORLD</h1>' },
      src: contractSrc
    });

    contract = warp.contract<ExampleContractState>(contractTxId).setEvaluationOptions({
      mineArLocalBlocks: false
    });
    contractVM = warp.contract<ExampleContractState>(contractTxId).setEvaluationOptions({
      useVM2: true,
      mineArLocalBlocks: false
    });
    contractInitData = warp.contract<ExampleContractState>(contractInitDataTxId).setEvaluationOptions({
      mineArLocalBlocks: false
    });
    contract.connect(wallet);
    contractVM.connect(wallet);
    contractInitData.connect(wallet);

    await mineBlock(warp);
  });

  afterAll(async () => {
    await arlocal.stop();
  });

  it('should properly deploy contract with initial state', async () => {
    expect((await contract.readState()).cachedValue.state.counter).toEqual(555);
    expect((await contractVM.readState()).cachedValue.state.counter).toEqual(555);
    expect((await contractInitData.readState()).cachedValue.state.counter).toEqual(555);
  });

  it('should properly add new interaction', async () => {
    await contract.writeInteraction({ function: 'add' });
    await contractInitData.writeInteraction({ function: 'add' });
    await mineBlock(warp);

    expect((await contract.readState()).cachedValue.state.counter).toEqual(556);
    expect((await contractVM.readState()).cachedValue.state.counter).toEqual(556);
    expect((await contractInitData.readState()).cachedValue.state.counter).toEqual(556);
  });

  it('should properly add another interactions', async () => {
    await contract.writeInteraction({ function: 'add' });
    await contractInitData.writeInteraction({ function: 'add' });
    await mineBlock(warp);
    await contract.writeInteraction({ function: 'add' });
    await contractInitData.writeInteraction({ function: 'add' });
    await mineBlock(warp);
    await contract.writeInteraction({ function: 'add' });
    await contractInitData.writeInteraction({ function: 'add' });
    await mineBlock(warp);

    expect((await contract.readState()).cachedValue.state.counter).toEqual(559);
    expect((await contractVM.readState()).cachedValue.state.counter).toEqual(559);
    expect((await contractInitData.readState()).cachedValue.state.counter).toEqual(559);
  });

  it('should properly view contract state', async () => {
    const interactionResult = await contract.viewState<unknown, number>({ function: 'value' });
    const interactionResultVM = await contractVM.viewState<unknown, number>({ function: 'value' });
    const interactionResultInitDataVM = await contractInitData.viewState<unknown, number>({ function: 'value' });
    expect(interactionResult.result).toEqual(559);
    expect(interactionResultVM.result).toEqual(559);
    expect(interactionResultInitDataVM.result).toEqual(559);
  });
});
