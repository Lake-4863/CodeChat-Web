'use client';

import { useEffect, useCallback, useRef } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;

export function useGlobalKey(key: string, handler: KeyHandler, options: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {}) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (options.ctrl && !e.ctrlKey) return;
      if (options.shift && !e.shiftKey) return;
      if (options.alt && !e.altKey) return;
      if (!options.ctrl && e.ctrlKey) return;
      // Only block shift for plain alphanumeric keys; special chars like `?` already encode shift in e.key
      if (!options.shift && e.shiftKey && /^[a-z0-9]$/i.test(key)) return;

      if (e.key.toLowerCase() !== key.toLowerCase()) return;

      const tag = (e.target as HTMLElement)?.tagName;
      const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable;
      if (isEditable && !options.ctrl) return;

      e.preventDefault();
      handler(e);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [key, handler, options.ctrl, options.shift, options.alt]);
}

export function useFeedNavigation(count: number) {
  const focusedIdx = useRef(-1);
  const setFocused = useCallback((idx: number) => {
    focusedIdx.current = Math.max(-1, Math.min(count - 1, idx));
    return focusedIdx.current;
  }, [count]);

  return { focusedIdx, setFocused };
}

export function useGPrefix(handlers: Record<string, () => void>) {
  const gPressed = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable;
      if (isEditable) return;

      if (e.key === 'g' && !e.ctrlKey) {
        gPressed.current = true;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => { gPressed.current = false; }, 1000);
        return;
      }

      if (gPressed.current) {
        gPressed.current = false;
        if (timer.current) clearTimeout(timer.current);
        const handler = handlers[e.key];
        if (handler) {
          e.preventDefault();
          e.stopImmediatePropagation();
          handler();
        }
        return;
      }
    };
    window.addEventListener('keydown', handle, { capture: true });
    return () => window.removeEventListener('keydown', handle, { capture: true });
  }, [handlers]);
}
