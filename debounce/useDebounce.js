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
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      latestFn.current(...args);
    }, delay);
    // fn is updated by useRef, so the callback is dependent to "delay"
  }, [delay]);

  const cancel = useCallback(() => {
    // clearTimeout only tells browser to stop the timer with such id
    clearTimeout(timer.current);
    // Explictly showing the timer vanish
    timer.current = null;
  }, []);

  // clean up timer when unmounted
  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  return { debounced, cancel };
};