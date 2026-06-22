import * as React from 'react';

export function useOnClickOutside<T extends HTMLElement>(ref: React.RefObject<T | null>, handler: () => void): void {
  React.useEffect(() => {
    const listener = (event: PointerEvent) => {
      const node = ref.current;
      if (!node || node.contains(event.target as Node)) return;
      handler();
    };

    document.addEventListener('pointerdown', listener);
    return () => document.removeEventListener('pointerdown', listener);
  }, [ref, handler]);
}
