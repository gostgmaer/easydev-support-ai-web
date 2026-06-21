import * as React from 'react';
import { trapFocus, getFocusableElements } from '@easydev/utils';

export interface FocusTrapProps {
  active?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}

export function FocusTrap({ active = true, initialFocusRef, children }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;

    const target = initialFocusRef?.current ?? getFocusableElements(container)[0];
    target?.focus();

    return trapFocus(container);
  }, [active, initialFocusRef]);

  return <div ref={containerRef}>{children}</div>;
}
