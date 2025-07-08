import { onUnmounted} from "vue";

export const useDebounce = (fn, delay) => {
  let timer = null;

  const debounced = (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };

  const cancel = () => {
    clearInterval(timer);
  };

  onUnmounted(() => {
    clearTimeout(timer);
  });
  
  return { debounced, cancel};
};
