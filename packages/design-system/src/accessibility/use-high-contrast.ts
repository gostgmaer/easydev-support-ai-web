'use client';

import * as React from 'react';

const HIGH_CONTRAST_CLASS = 'high-contrast';
const STORAGE_KEY = 'easydev.high-contrast';

export interface UseHighContrastResult {
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  toggleHighContrast: () => void;
}

/**
 * Tracks and toggles the `.high-contrast` class on <html>. Honors the
 * `prefers-contrast: more` media query as the default, with a user override
 * persisted to localStorage.
 */
export function useHighContrast(): UseHighContrastResult {
  const [highContrast, setHighContrastState] = React.useState(false);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const systemPrefers = window.matchMedia('(prefers-contrast: more)').matches;
    const initial = stored !== null ? stored === 'true' : systemPrefers;
    setHighContrastState(initial);
    document.documentElement.classList.toggle(HIGH_CONTRAST_CLASS, initial);
  }, []);

  const setHighContrast = React.useCallback((enabled: boolean) => {
    setHighContrastState(enabled);
    document.documentElement.classList.toggle(HIGH_CONTRAST_CLASS, enabled);
    window.localStorage.setItem(STORAGE_KEY, String(enabled));
  }, []);

  const toggleHighContrast = React.useCallback(() => {
    setHighContrast(!highContrast);
  }, [highContrast, setHighContrast]);

  return { highContrast, setHighContrast, toggleHighContrast };
}
