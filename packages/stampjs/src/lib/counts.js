import { of, fromPromise, Resolved, Rejected } from "../adts/async.js";
import {
  map,
  includes,
  filter,
  compose,
  propEq,
  propOr,
  length,
  __,
} from "ramda";

export function counts(env, txIDs) {
  const aoDryRun = fromPromise(env.aoDryRun);

  return of(txIDs)
    .chain(doRead(aoDryRun))
    .chain(handleResponse)
  }

function doRead(aoDryRun) {
  return (txIds) => {
    return aoDryRun(
      [
        { name: 'Action', value: 'Read-Stamps-By-Asset' }, 
        { name: "Protocol-Name", value: "Stamp" },
        { name: "Render-With", value: "card_stamps" },
        { name: `Data-Sources`, value: JSON.stringify(txIds) }
      ]
    );
  }
}
  
function handleResponse(ctx) {
  const message = ctx.Messages[0]
  if (includes({ name: 'Result', value: 'Success' })(message.Tags)) {
    const stampCounts = compose(
      map((stamp) => ({ total: length(stamp), vouched: length(filter(propEq('true', 'Vouched'), stamp)) })),
      JSON.parse,
      propOr('{}', 'Data')
    )(message)
    return Resolved(stampCounts)
  }
  return Rejected(message.Data)
}