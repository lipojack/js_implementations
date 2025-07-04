// debounce handles repeated calls, adopt last call and run after delay
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    const context = this; // force "this" scope to the return function, in case the setTimeout apply a class function
    clearTimeout(timer);
    timer = setTimeout(() => {
      // In case the fn need to access itself's attributes, apply give it the power of using this
      fn.apply(context, args);
      // For straightforward function, but the fn does not have ability to access it's attributes
      // fn(...args);
    }, delay)
  }
};


// TODOs:
// leading, trailing
// maxWait