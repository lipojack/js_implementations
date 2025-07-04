import { useRef, useEffect, useCallback } from 'react';

export const useDebounce = (fn, delay) => {
  const timer = useRef(null);
  // memorize and update fn cause fn might change if parent re-render
  const latestFn = useRef(fn);
  
  // make sure the fn is up to date
  useEffect(() => {
    latestFn.current = fn;
  }, [fn]);

  const debounced = useCallback((...args) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      latestFn.current(...args);
    }, delay);
  // fn is updated by useRef, so the callback is dependet to "delay"
  }, [delay]);

  // clean up timer when unmounted
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return debounced;
};