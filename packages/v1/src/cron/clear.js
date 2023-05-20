export function clear(env, state) {
  if (!state.stampHxClear) {
    state.stampHxClear = env.height - 1
  }
  if (state.stampHxClear < env.height) {
    state.stampHistory = {}
    state.stampHxClear = env.height + (720 * 182)
  }
  return state
}