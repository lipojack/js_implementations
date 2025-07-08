import { onUnmounted, watch, isRef, ref } from "vue";

export const useDebounceFn = (fn, delay) => {
  let timer = null;
  
  // check if fn, delay is reactive
  const getFn = () => isRef(fn) ? fn.value : fn;
  const getDelay = () => isRef(delay) ? delay.value : delay;

  const debounced = (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      getFn()(...args);
    }, getDelay());
  };

  const cancel = () => {
    clearTimeout(timer);
    timer = null;
  };
  
  // watch [fn, delay] if they are reactive
  if (isRef(fn) || isRef(delay)) {
    watch([fn, delay], cancel);
  }

  onUnmounted(cancel);
  
  return { debounced, cancel };
};

export const useDebounceVal = (sourceRef, delay) => {
  let timer = null;
  // make the debounced reactive for consumers
  const debounced = ref(sourceRef.value);
  
  watch(sourceRef, (val) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      debounced.value = val; 
    }, delay);
  });

  onUnmounted(() => {
    clearTimeout(timer);
    timer = null;
  });

  return debounced;
};