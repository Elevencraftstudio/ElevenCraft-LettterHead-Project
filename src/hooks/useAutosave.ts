import { useEffect, useRef, useCallback, useState } from 'react';
import { useDebouncedCallback } from './useDebounce';

interface AutosaveOptions {
  key: string;
  delay?: number;
  onSave?: (data: string) => void | Promise<void>;
}

export function useAutosave<T extends Record<string, any>>(
  data: T,
  options: AutosaveOptions,
) {
  const { key, delay = 2000, onSave } = options;
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const prevRef = useRef(data);

  const persist = useDebouncedCallback(
    async (d: T) => {
      try {
        setStatus('saving');
        const serialized = JSON.stringify(d);
        localStorage.setItem(`autosave:${key}`, serialized);
        await onSave?.(serialized);
        setStatus('saved');
      } catch {
        setStatus('error');
      }
    },
    delay,
    [key, onSave],
  );

  useEffect(() => {
    if (data !== prevRef.current) {
      prevRef.current = data;
      persist(data);
    }
  }, [data, persist]);

  const restore = useCallback((): T | null => {
    try {
      const raw = localStorage.getItem(`autosave:${key}`);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }, [key]);

  const clear = useCallback(() => {
    localStorage.removeItem(`autosave:${key}`);
    setStatus('idle');
  }, [key]);

  return { status, restore, clear };
}
