import { of, fromPromise, Resolved, Rejected } from "../adts/async.js";
import {
  compose,
  propOr,
  propEq,
  includes,
  length,
  filter
} from "ramda";

// returns { total: number, vouched: number }
export function count(env, tx) {
  const aoDryRun = fromPromise(env.aoDryRun);

  return of(tx)
    .chain(doRead(aoDryRun))
    .chain(handleCount)
}

function handleCount(ctx) {
  const message = ctx.Messages[0]
  if (includes({ name: 'Result', value: 'Success' })(message.Tags)) {
    const stampCount = compose(
      (stamps) => ({ total: length(stamps), vouched: length(filter(propEq('true', 'Vouched'), stamps)) }),
      propOr([], 'stampsByAsset'),
      JSON.parse,
      propOr('{}', 'Data')
    )(message)
    return Resolved(stampCount)
  }
  return Rejected(message.Data)
}

function doRead(aoDryRun) {
  return (tx) => {
    return aoDryRun(
      [
        { name: 'Action', value: 'Read-Stamps-By-Asset' }, 
        { name: "Data-Source", value: tx },
        { name: "Protocol-Name", value: "Stamp" },
        { name: "Render-With", value: "card_stamps" },
      ]
    );
  }
}
