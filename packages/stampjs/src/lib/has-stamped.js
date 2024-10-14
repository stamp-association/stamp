import { of, fromPromise, Resolved, Rejected } from "../adts/async.js";
import { map, includes, compose, propOr, filter, equals, length, forEach } from 'ramda'


export function hasStamped(env, tx) {
  const getAddress = fromPromise(env.getAddress)
  const aoDryRun = fromPromise(env.aoDryRun)

  tx = typeof tx === "string" ? [tx] : tx
  return of(tx)
    .chain((tx) => getAddress().map((address) => ({ tx, address })))
    .chain(doRead(aoDryRun))
    .map((res) => ({ tx, res }))
    .chain(handleHasStamped)
}
function handleHasStamped(ctx) {
  const { res, tx } = ctx
  const message = res.Messages[0]
  if (includes({ name: 'Result', value: 'Success' })(message.Tags)) {
    const stampArray = compose(
      map(propOr('', 'Asset')),
      propOr([], 'stampsByAddress'),
      JSON.parse,
      propOr('{}', 'Data')
    )(message)

    const includesTx = (txId) => stampArray.includes(txId)
    if (tx.length == 1) {
      const hasStamped = includesTx(tx[0])
      return Resolved(hasStamped)
    }
    const hasStampedTxs = {}
    forEach((tx) => hasStampedTxs[tx] = includesTx(tx))(tx)
    return Resolved(hasStampedTxs)
  }
  return Rejected(message.Data)
}
function doRead(aoDryRun) {
  return ({ tx, address }) => {
    return aoDryRun(
        [
          { name: 'Action', value: 'Read-Stamps-By-Address' }, 
          { name: "Data-Source", value: address },
          { name: "Protocol-Name", value: "Stamp" },
          { name: "Render-With", value: "card_stamps" },
        ]
      )
  }
}
