import { useCallback, useEffect, useRef } from 'react';

export function usePrevious<T>(value: T, initialValue?: T): T | undefined {
  const ref = useRef<T | undefined>(initialValue);

  useEffect(() => {
    if (value !== ref.current) ref.current = value;
  }, [value]);

  return ref.current;
}

export type DebouncerType = [(callback: DebouncerCallback) => void, () => void];

type DebouncerCallback = () => unknown | Promise<unknown>;

export function useDebouncer(delay: number): DebouncerType {
  const timeout = useRef<NodeJS.Timeout | null>(null);

  const debounce = useCallback(
    (callback: DebouncerCallback) => {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(callback, delay);
    },
    [delay]
  );

  const clearDebounce = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  return [debounce, clearDebounce];
}

export function useDidMount() {
  const didMountRef = useRef(false);

  useEffect(() => {
    didMountRef.current = true;
  }, []);

  return didMountRef.current;
}
