import { ExecutionContext, HandlerApi } from '@warp';

/**
 * This adds ability to modify current execution context based
 * on state - example (and currently only) use case is the "evolve" feature.
 */
export interface ExecutionContextModifier {
  modify<State>(
    state: State,
    executionContext: ExecutionContext<State, HandlerApi<State>>
  ): Promise<ExecutionContext<State, HandlerApi<State>>>;
}
