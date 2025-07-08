import { onUnmounted, isRef, watch, ref } from "vue";

export const useThrottleFn = (fn, delay) => {
  
  const getFn = () => isRef(fn) ? fn.value : fn;
  const getDelay = () => isRef(delay) ? delay.value : delay;

  let lastCall = 0;
  let timer = null;

  const throttled = (...args) => {
    const now = Date.now();
    const sinceLastcall = now - lastCall;

    if (sinceLastcall >= getDelay()) {
      lastCall = now;
      getFn()(...args);
    } else {
      if (timer === null) {
        timer = setTimeout(() => {
          timer = null;
          lastCall = now;
          getFn()(...args);
        }, getDelay() - sinceLastcall);
      }
    }
  };

  const cancel = () => {
    clearTimeout(timer);
    timer = null;
  };

  if (isRef(fn) || isRef(delay)) {
    watch([fn, delay], cancel);
  }

  onUnmounted(cancel);

  return { throttled, cancel };
};

export const useThrottleVal = (sourceRef, delay) => {
  let lastCall = 0;
  const throttled = ref(sourceRef.value);

  watch(sourceRef, (val) => {
    const now = Date.now();
    const sinceLastcall = now - lastCall;
    if (sinceLastcall >= delay) {
      throttled.value = val;
      lastCall = now;
    }
  });

  return throttled;
};