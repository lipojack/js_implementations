import { useEffect, useRef, useCallback } from "react";

export const useThrottle = (fn, delay) => {
  const lastCall = useRef(0);
  const latestFn = useRef(fn);
  const timer = useRef(null);
  // to preserve the args
  const trailingArgs = useRef(null);

  useEffect(() => {
    latestFn.current = fn;
  }, [fn]);

  const throttled = useCallback((...args) => {
    const now = Date.now();
    const sinceLastcall = now - lastCall.current;
    if (sinceLastcall >= delay) {
      lastCall.current = now;
      latestFn.current(...args);
    } else {
      // preserving args across timeout
      trailingArgs.current = args;
      if (!timer.current) {
        timer.current = setTimeout(() => {
          timer.current = null;
          lastCall.current = Date.now();
          // make sure there's a pending trailing call, also consider if it's canceled
          if (trailingArgs.current) {
            latestFn.current(...trailingArgs.current);
            trailingArgs.current = null;
          }
        }, delay - sinceLastcall);
      }
    }
  }, [delay]);

  const cancel = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = null;
    trailingArgs.current = null;
  }, []);

  useEffect(() => cancel, [cancel]);

  return { throttled, cancel };
};