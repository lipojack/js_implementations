// debounce handles repeated calls, adopt last call and run after delay
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      // Incase the fn need to access itself's attributes, apply give it the power of using this
      fn.apply(this, args);
      // For straightforward function, but the fn does not have ability to access it's attributes
      // fn(...args);
    }, delay)
  }
};


