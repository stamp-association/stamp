export async function handle(state, action) {
  if (state.counter === undefined) {
    state.counter = 0;
  }

  if (action.input.function === 'loop') {
    let i = 0;
    // well, not really an inf. loop, as Jest will cry here
    // that async operations were not stopped.
    while (i++ < 2) {
      await timeout(1000);
      state.counter++;
    }

    return { state };
  }

  if (action.input.function === 'add') {
    state.counter += 10;
    return { state };
  }

  function timeout(delay) {
    return new Promise(function (resolve) {
      setTimeout(resolve, delay);
    });
  }
}
