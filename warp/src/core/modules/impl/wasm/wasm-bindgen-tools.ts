export function matchMutClosureDtor(source: string) {
  const regexp = /var ret = makeMutClosure\(arg0, arg1, (\d+?), __wbg_adapter/;
  const match = source.match(regexp);
  return match[1];
}
