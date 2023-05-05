/**
 * hyper63/either module
 *
 * This module implements the either monad the codebase is largely based from Dr. Boolean - Brian Lonsdorf and his
 * frontend masters courses. The two reasons for pulling these into independent modules is that over time
 * we may want to add additional helper functions to the type, and to reduce third party dependencies.
 *
 */
/**
 * @typedef {Object} Either
 * @property {Boolean} isLeft
 * @property {Function} chain
 * @property {Function} ap
 * @property {Function} alt
 * @property {Function} extend
 * @property {Function} concat
 * @property {Function} traverse
 * @property {Function} map
 * @property {Function} toString
 * @property {Function} extract
 */
/**
 * @param {any} x
 * @returns {Either}
 */
export const Right = (x) => ({
  isLeft: false,
  chain: (f) => f(x),
  ap: (other) => other.map(x),
  alt: (other) => Right(x),
  extend: (f) => f(Right(x)),
  concat: (other) =>
    other.fold(
      (x) => other,
      (y) => Right(x.concat(y))
    ),
  traverse: (of, f) => f(x).map(Right),
  map: (f) => Right(f(x)),
  fold: (_, g) => g(x),
  toString: () => `Right(${x})`,
  extract: () => x,
});

/**
 * @param {any} x
 * @returns {Either}
 */
export const Left = (x) => ({
  isLeft: true,
  chain: (_) => Left(x),
  ap: (_) => Left(x),
  extend: (_) => Left(x),
  alt: (other) => other,
  concat: (_) => Left(x),
  traverse: (of, _) => of(Left(x)),
  map: (_) => Left(x),
  fold: (f, _) => f(x),
  toString: () => `Left(${x})`,
  extract: () => x,
});

/**
 * @param {any} x
 * @returns {Either}
 */
export const of = Right;

/**
 * @param {function} f
 * @returns {Either}
 */
export const tryCatch = (f) => {
  try {
    return Right(f());
  } catch (e) {
    return Left(e);
  }
};

/**
 * @param {any} x
 * @returns {Either}
 */
export const fromNullable = (x) => (x != null ? Right(x) : Left(x));

export const Either = {
  Right,
  Left,
  of,
  tryCatch,
  fromNullable,
};
