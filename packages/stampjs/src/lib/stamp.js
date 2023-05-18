import Async from 'hyper-async'

const { fromPromise } = Async

/* 
 * check and see if tx is atomic asset
 * and user is vouched
 * if is then stamp with interaction
 * else stamp as a bundle transaction
 */
export function stamp(env, tx, qty = 0, tags = {}) {
  const writeInteraction = fromPromise(env.writeInteraction)
  return writeInteraction({
    function: 'stamp',
    qty
  }, [
    { name: 'Data-Source', value: tx },
    { name: 'Protocol-Name', value: 'Stamp' },
    ...Object.keys(tags).map(k => ({ name: k, value: tags[k] }))
  ])
}