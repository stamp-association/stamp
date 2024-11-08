import { of, fromPromise } from "../adts/async.js";

export function stamp(env, tx, qty = 0, tags = {}) {
  const writeInteraction = fromPromise(env.writeInteraction);
  const readInteraction = fromPromise(env.readInteraction)
  const getAddress = fromPromise(env.getAddress);

  function doRead(readInteraction) {
    return (messageTx) => {
      return readInteraction(messageTx, tx);
    }
  }
  
  return of({ tx, qty, tags })
    .map(formatTags) // format optional parameter tags
    .chain(getCaller(getAddress)) // getAddress = web wallet address, getCaller = maps it
    .chain(doWrite(writeInteraction))
    .chain(doRead(readInteraction))
}

function getCaller(getAddress) {
  return (ctx) => {
    return getAddress().map((addr) => ({ ...ctx, caller: addr }));
  };
}

function doWrite(writeInteraction) {
  return (ctx) => {
    return writeInteraction(
      [
        { name: 'Action', value: 'Write-Stamp' }, 
        { name: "Data-Source", value: ctx.tx },
        { name: "Protocol-Name", value: "Stamp" },
        { name: "Render-With", value: "card_stamps" },
        { name: "Super-Stamp-Quantity", value: ctx.qty.toString() },
        ...ctx.tags,
      ]
    );
  }
}

function formatTags(ctx) {
  const tags = Object.keys(ctx.tags).map((k) => ({
    name: k,
    value: ctx.tags[k],
  }));
  return { ...ctx, tags };
}
