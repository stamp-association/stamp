const head = (list) => list[0];
const reverse = (list) => list.reverse();
const split = (v) => (s) => s.split(v);
const takeLast = (n) => (list) => list.filter((_, i) => i >= list.length - n);
const compose =
  (...fns) =>
  (v) =>
    fns.reverse().reduce((a, fn) => fn(a), v);
const length = (x) => x.length || 0;
const identity = (x) => x;
const always = (x) => (y) => x;
const ifElse = (c, a, b) => (v) => c(v) ? a(v) : b(v);
const lt = (x) => (y) => x < y;

export function getSubdomain(hostname) {
  return compose(
    head,
    reverse,
    split("_"),
    head,
    ifElse(compose(lt(2), length), identity, always([""])),
    takeLast(3),
    split(".")
  )(hostname);
}
