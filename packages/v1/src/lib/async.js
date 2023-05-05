import { array } from "./array.js";

/**
 * @callback Function
 * @param {unknown} x
 * @returns {unknown}
 *
 * @callback AsyncFunction
 * @param {unknown}
 * @returns {Async}
 *
 * @callback BiFunction
 * @param {Function}
 * @param {Function}
 * @returns {Async}
 *
 * @callback Handler
 * @param {unknown} x
 * @returns {unknown}
 *
 * @callback Fork
 * @param {Handler} rejected
 * @param {Handler} resolved
 * @returns {unknown}
 *
 * @callback Map
 * @param {Function}
 * @returns {Async}
 *
 * @callback Chain
 * @param {AsyncFunction}
 * @returns {Async}
 *
 * @callback Async
 * @param {Fork} fork
 * @returns {{fork: Fork, toPromise: Promise<unknown>, map: Map, bimap: BiFunction, chain: Chain, bichain: BiChainFn, fold: Fold}}
 */
const Async = (fork) => ({
  ["@@type"]: "Async",
  fork,
  toPromise: () => new Promise((resolve, reject) => fork(reject, resolve)),
  ap: (other) =>
    Async((rej, res) => fork(rej, (f) => other.fork(rej, (x) => res(f(x))))),
  map: (fn) => Async((rej, res) => fork(rej, (x) => res(fn(x)))),
  bimap: (f, g) =>
    Async((rej, res) =>
      fork(
        (x) => rej(f(x)),
        (x) => res(g(x))
      )
    ),
  chain: (fn) => Async((rej, res) => fork(rej, (x) => fn(x).fork(rej, res))),
  bichain: (f, g) =>
    Async((rej, res) =>
      fork(
        (x) => f(x).fork(rej, res),
        (x) => g(x).fork(rej, res)
      )
    ),
  fold: (f, g) =>
    Async((rej, res) =>
      fork(
        (x) => f(x).fork(rej, res),
        (x) => g(x).fork(rej, res)
      )
    ),
});

export const of = (x) => Async((rej, res) => res(x));
export const Resolved = (x) => Async((rej, res) => res(x));
export const Rejected = (x) => Async((rej, res) => rej(x));

export const all = (xs) => {
  if (
    !(
      Boolean(xs.reduce) &&
      xs.reduce((a, x) => a && x["@@type"] === "Async", true)
    )
  ) {
    throw new Error("Async.all: Argument must be foldable of asyncs");
  }
  if (Array.isArray(xs)) {
    return array.sequence(of, xs);
  }
};

export const fromPromise =
  (f) =>
  (...args) =>
    Async((rej, res) =>
      f(...args)
        .then(res)
        .catch(rej)
    );

export default {
  of,
  fromPromise,
  Resolved,
  Rejected,
  all,
};
