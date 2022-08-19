import Arweave from 'arweave';
import {
  Benchmark,
  ContractDefinition,
  EvalStateResult,
  EvaluationOptions,
  ExecutionContext,
  ExecutorFactory,
  GQLNodeInterface,
  JsHandlerApi,
  LoggerFactory,
  MemCache,
  normalizeContractSource,
  SmartWeaveGlobal,
  WarpCache,
  WasmHandlerApi
} from '@warp';
import loader from '@assemblyscript/loader';
import { asWasmImports } from './wasm/as-wasm-imports';
import { rustWasmImports } from './wasm/rust-wasm-imports';
import { Go } from './wasm/go-wasm-imports';
import BigNumber from 'bignumber.js';
import * as vm2 from 'vm2';
import * as Buffer from 'buffer';

class ContractError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ContractError';
  }
}

/**
 * A factory that produces handlers that are compatible with the "current" style of
 * writing SW contracts (i.e. using "handle" function).
 */
export class HandlerExecutorFactory implements ExecutorFactory<HandlerApi<unknown>> {
  private readonly logger = LoggerFactory.INST.create('HandlerExecutorFactory');

  // TODO: cache compiled wasm binaries here.
  private readonly cache: WarpCache<string, WebAssembly.Module> = new MemCache();

  constructor(private readonly arweave: Arweave) {}

  async create<State>(
    contractDefinition: ContractDefinition<State>,
    evaluationOptions: EvaluationOptions
  ): Promise<HandlerApi<State>> {
    const swGlobal = new SmartWeaveGlobal(
      this.arweave,
      {
        id: contractDefinition.txId,
        owner: contractDefinition.owner
      },
      evaluationOptions
    );

    if (contractDefinition.contractType == 'wasm') {
      this.logger.info('Creating handler for wasm contract', contractDefinition.txId);
      const benchmark = Benchmark.measure();

      let wasmInstance;
      let jsExports = null;

      const wasmResponse = generateResponse(contractDefinition.srcBinary);

      switch (contractDefinition.srcWasmLang) {
        case 'assemblyscript': {
          const wasmInstanceExports = {
            exports: null
          };
          wasmInstance = await loader.instantiateStreaming(wasmResponse, asWasmImports(swGlobal, wasmInstanceExports));
          // note: well, exports are required by some imports
          // - e.g. those that use wasmModule.exports.__newString underneath (like Block.indep_hash)
          wasmInstanceExports.exports = wasmInstance.exports;
          break;
        }
        case 'rust': {
          const wasmInstanceExports = {
            exports: null,
            modifiedExports: {
              wasm_bindgen__convert__closures__invoke2_mut__: null,
              _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__:
                null
            }
          };

          /**
           * wasm-bindgen mangles import function names (adds some random number after "base name")
           * - that's why we cannot statically build the imports in the SDK.
           * Instead - we need to first compile the module and check the generated
           * import function names (all imports from the "__wbindgen_placeholder__" import module).
           * Having those generated function names - we need to then map them to import functions -
           * see {@link rustWasmImports}
           *
           * That's probably a temporary solution - it would be the best to force the wasm-bindgen
           * to NOT mangle the import function names - unfortunately that is not currently possible
           * - https://github.com/rustwasm/wasm-bindgen/issues/1128
           */
          const wasmModule = await getWasmModule(wasmResponse, contractDefinition.srcBinary);
          const moduleImports = WebAssembly.Module.imports(wasmModule);
          const wbindgenImports = moduleImports
            .filter((imp) => {
              return imp.module === '__wbindgen_placeholder__';
            })
            .map((imp) => imp.name);

          const { imports, exports } = rustWasmImports(
            swGlobal,
            wbindgenImports,
            wasmInstanceExports,
            contractDefinition.metadata.dtor
          );
          jsExports = exports;

          wasmInstance = await WebAssembly.instantiate(wasmModule, imports);
          wasmInstanceExports.exports = wasmInstance.exports;

          const moduleExports = Object.keys(wasmInstance.exports);

          // ... no comments ...
          moduleExports.forEach((moduleExport) => {
            if (moduleExport.startsWith('wasm_bindgen__convert__closures__invoke2_mut__')) {
              wasmInstanceExports.modifiedExports.wasm_bindgen__convert__closures__invoke2_mut__ =
                wasmInstance.exports[moduleExport];
            }
            if (
              moduleExport.startsWith(
                '_dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__'
              )
            ) {
              wasmInstanceExports.modifiedExports._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__ =
                wasmInstance.exports[moduleExport];
            }
          });
          break;
        }
        case 'go': {
          const go = new Go(swGlobal);
          go.importObject.metering = {
            usegas: function (value) {
              swGlobal.useGas(value);
            }
          };
          const wasmModule = await getWasmModule(wasmResponse, contractDefinition.srcBinary);
          wasmInstance = await WebAssembly.instantiate(wasmModule, go.importObject);

          // nope - DO NOT await here!
          go.run(wasmInstance);
          jsExports = go.exports;
          break;
        }

        default: {
          throw new Error(`Support for ${contractDefinition.srcWasmLang} not implemented yet.`);
        }
      }
      this.logger.info(`WASM ${contractDefinition.srcWasmLang} handler created in ${benchmark.elapsed()}`);
      return new WasmHandlerApi(swGlobal, contractDefinition, jsExports || wasmInstance.exports);
    } else {
      this.logger.info('Creating handler for js contract', contractDefinition.txId);
      const normalizedSource = normalizeContractSource(contractDefinition.src, evaluationOptions.useVM2);

      if (!evaluationOptions.allowUnsafeClient) {
        if (normalizedSource.includes('SmartWeave.unsafeClient')) {
          throw new Error(
            'Using unsafeClient is not allowed by default. Use EvaluationOptions.allowUnsafeClient flag.'
          );
        }
      }
      if (!evaluationOptions.allowBigInt) {
        if (normalizedSource.includes('BigInt')) {
          throw new Error('Using BigInt is not allowed by default. Use EvaluationOptions.allowBigInt flag.');
        }
      }
      if (evaluationOptions.useVM2) {
        const vmScript = new vm2.VMScript(normalizedSource);
        const vm = new vm2.NodeVM({
          console: 'off',
          sandbox: {
            SmartWeave: swGlobal,
            BigNumber: BigNumber,
            logger: this.logger,
            ContractError: ContractError,
            ContractAssert: function (cond, message) {
              if (!cond) throw new ContractError(message);
            }
          },
          compiler: 'javascript',
          eval: false,
          wasm: false,
          allowAsync: true,
          wrapper: 'commonjs'
        });

        return new JsHandlerApi(swGlobal, contractDefinition, vm.run(vmScript));
      } else {
        const contractFunction = new Function(normalizedSource);
        const handler = contractFunction(swGlobal, BigNumber, LoggerFactory.INST.create(swGlobal.contract.id));
        return new JsHandlerApi(swGlobal, contractDefinition, handler);
      }
    }
  }
}

function generateResponse(wasmBinary: Buffer): Response {
  const init = { status: 200, statusText: 'OK', headers: { 'Content-Type': 'application/wasm' } };
  return new Response(wasmBinary, init);
}

async function getWasmModule(wasmResponse: Response, binary: Buffer): Promise<WebAssembly.Module> {
  if (WebAssembly.compileStreaming) {
    return await WebAssembly.compileStreaming(wasmResponse);
  } else {
    return await WebAssembly.compile(binary);
  }
}

export interface InteractionData<Input> {
  interaction?: ContractInteraction<Input>;
  interactionTx: GQLNodeInterface;
  currentTx: { interactionTxId: string; contractTxId: string }[];
}

/**
 * A handle that effectively runs contract's code.
 */
export interface HandlerApi<State> {
  handle<Input, Result>(
    executionContext: ExecutionContext<State>,
    currentResult: EvalStateResult<State>,
    interactionData: InteractionData<Input>
  ): Promise<InteractionResult<State, Result>>;

  initState(state: State): void;
}

export type HandlerFunction<State, Input, Result> = (
  state: State,
  interaction: ContractInteraction<Input>
) => Promise<HandlerResult<State, Result>>;

// TODO: change to XOR between result and state?
export type HandlerResult<State, Result> = {
  result: Result;
  state: State;
  gasUsed?: number;
};

export type InteractionResult<State, Result> = HandlerResult<State, Result> & {
  type: InteractionResultType;
  errorMessage?: string;
  originalValidity?: Record<string, boolean>;
  originalErrorMessages?: Record<string, string>;
};

export type ContractInteraction<Input> = {
  input: Input;
  caller: string;
};

export type InteractionResultType = 'ok' | 'error' | 'exception';
