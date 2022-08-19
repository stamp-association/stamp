import { EvalStateResult, GQLNodeInterface } from '@warp';

//export type StateCache<State> = Array<EvalStateResult<State>>;
export function canBeCached(tx: GQLNodeInterface): boolean {
  // in case of using non-redstone gateway
  if (tx.confirmationStatus === undefined) {
    return true;
  } else {
    return tx.confirmationStatus === 'confirmed';
  }
}
