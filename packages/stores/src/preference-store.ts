import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Density = 'comfortable' | 'compact';

export interface PreferenceState {
  theme: ThemeMode;
  density: Density;
  locale: string;
  keyboardShortcutsEnabled: boolean;
  setTheme: (theme: ThemeMode) => void;
  setDensity: (density: Density) => void;
  setLocale: (locale: string) => void;
  setKeyboardShortcutsEnabled: (enabled: boolean) => void;
}

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set) => ({
      theme: 'system',
      density: 'comfortable',
      locale: 'en-US',
      keyboardShortcutsEnabled: true,
      setTheme: (theme) => set({ theme }),
      setDensity: (density) => set({ density }),
      setLocale: (locale) => set({ locale }),
      setKeyboardShortcutsEnabled: (enabled) => set({ keyboardShortcutsEnabled: enabled }),
    }),
    {
      name: 'easydev.preferences',
      storage: createJSONStorage(() =>
        typeof window === 'undefined'
          ? { getItem: () => null, setItem: () => {}, removeItem: () => {} }
          : window.localStorage,
      ),
    },
  ),
);
