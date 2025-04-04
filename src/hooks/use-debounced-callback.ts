import { useCallback, useEffect, useRef } from 'react';

export function useDebouncedCallback<A extends any[]>(
  callback: (...args: A) => void,
  delay: number
): (...args: A) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure cleanup happens on unmount or change of dependencies
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []); // Empty array means cleanup runs only on unmount

  const debouncedCallback = useCallback((...args: A) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]); // Recreate debounced function if callback or delay changes

  return debouncedCallback;
} 