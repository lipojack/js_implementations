export const throttle = (fn, delay) => {
  let lastCall = 0;
  return (...args) => {
    const context = this;
    const now = Date.now();
    // Initial call will run instantly cause now - 0 always >= delay
    if (now - lastCall >= delay) {
      fn.apply(context, args);
      lastCall = now;
    }
  }
}

// TODOs:
// leading, trailing