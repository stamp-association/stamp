import {
  filter,
  reduce,
  assoc,
  keys,
  compose,
  lte,
} from "ramda";

// handle processing credits a year later
export function credit({ height }) {
  return (state, action) => {
    if (!state.credits) {
      state.credits = {};
      return state;
    }

    Object.keys(state.credits)
      .filter((k) => k < height)
      .forEach((k) => {
        state.credits[k].forEach((c) => {
          if (!state.balances[c.holder]) {
            state.balances[c.holder] = 0;
          }
          state.balances[c.holder] += c.qty;
        });
      });

    state.credits = compose(
      reduce((a, v) => assoc(v, state.credits[v], a), {}),
      filter(lte(height)),
      keys
    )(state.credits)
    return state
  };
}
