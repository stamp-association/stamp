import { includes } from "ramda"
import { fromPromise, of, Rejected, Resolved } from "../adts/async.js";

export function balance(env, address) {
  const aoDryRun = fromPromise(env.aoDryRun);

  return of({ address })
    .chain(doRead(aoDryRun))
    .chain(handleBalance)
}
function handleBalance(ctx) {
  const message = ctx.Messages[0]
  if (includes({ name: 'Result', value: 'Success' })(message.Tags)) {
    return Resolved(parseInt(message.Data))
  }
  return Rejected(message.Data)
}
function doRead(aoDryRun) {
  return ({ address }) => {
    return aoDryRun(
      [
        { name: 'Action', value: 'Read-Balance' }, 
        { name: 'Recipient', value: address },
        { name: "Protocol-Name", value: "Stamp" },
        { name: "Render-With", value: "card_stamps" },
      ]
    );
  }
}