import {
  EvolveState,
  ExecutionContext,
  ExecutionContextModifier,
  HandlerApi,
  LoggerFactory,
  SmartWeaveError,
  SmartWeaveErrorType
} from '@warp';

function isEvolveCompatible(state: unknown): state is EvolveState {
  if (!state) {
    return false;
  }
  const settings = evalSettings(state);

  return (state as EvolveState).evolve !== undefined || settings.has('evolve');
}

export class Evolve implements ExecutionContextModifier {
  private readonly logger = LoggerFactory.INST.create('Evolve');

  constructor() {
    this.modify = this.modify.bind(this);
  }

  async modify<State>(
    state: State,
    executionContext: ExecutionContext<State, HandlerApi<State>>
  ): Promise<ExecutionContext<State, HandlerApi<State>>> {
    const { definitionLoader, executorFactory } = executionContext.warp;

    const contractTxId = executionContext.contractDefinition.txId;
    const evolvedSrcTxId = Evolve.evolvedSrcTxId(state);
    const currentSrcTxId = executionContext.contractDefinition.srcTxId;

    if (evolvedSrcTxId) {
      this.logger.debug('Checking evolve:', {
        current: currentSrcTxId,
        evolvedSrcTxId
      });

      if (currentSrcTxId !== evolvedSrcTxId) {
        try {
          // note: that's really nasty IMO - loading original contract definition,
          // but forcing different sourceTxId...
          this.logger.info('Evolving to: ', evolvedSrcTxId);
          const newContractDefinition = await definitionLoader.load<State>(contractTxId, evolvedSrcTxId);
          const newHandler = (await executorFactory.create<State>(
            newContractDefinition,
            executionContext.evaluationOptions
          )) as HandlerApi<State>;

          //FIXME: side-effect...
          executionContext.contractDefinition = newContractDefinition;
          executionContext.handler = newHandler;
          executionContext.handler.initState(state);
          this.logger.debug('evolved to:', {
            evolve: evolvedSrcTxId,
            newSrcTxId: executionContext.contractDefinition.srcTxId,
            current: currentSrcTxId,
            txId: executionContext.contractDefinition.txId
          });

          return executionContext;
        } catch (e) {
          throw new SmartWeaveError(SmartWeaveErrorType.CONTRACT_NOT_FOUND, {
            message: `Contract having txId: ${contractTxId} not found`,
            requestedTxId: contractTxId
          });
        }
      }
    }

    return executionContext;
  }

  static evolvedSrcTxId(state: unknown): string | undefined {
    if (!isEvolveCompatible(state)) {
      return undefined;
    }

    const settings = evalSettings(state);

    // note: from my understanding - this variable holds the id of the transaction with updated source code.
    const evolve: string = state.evolve || settings.get('evolve');

    let canEvolve: boolean = state.canEvolve || settings.get('canEvolve');

    // By default, contracts can evolve if there's not an explicit `false`.
    if (canEvolve === undefined || canEvolve === null) {
      canEvolve = true;
    }

    if (evolve && /[a-z0-9_-]{43}/i.test(evolve) && canEvolve) {
      return evolve;
    }

    return undefined;
  }
}

function evalSettings(state: any): Map<string, any> {
  // default  - empty
  let settings = new Map<string, any>();
  if (state.settings) {
    // for Iterable format
    if (isIterable(state.settings)) {
      settings = new Map<string, any>(state.settings);
      // for Object format
    } else if (isObject(state.settings)) {
      settings = new Map<string, any>(Object.entries(state.settings));
    }
  }

  return settings;
}

function isIterable(obj: unknown): boolean {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}

function isObject(obj: unknown): boolean {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}
