import { create } from 'zustand';
import type { FeatureFlagMap } from '@easydev/types';

export interface FeatureFlagState {
  flags: FeatureFlagMap;
  resolvedAt: number | null;
  setFlags: (flags: FeatureFlagMap) => void;
  reset: () => void;
}

export const useFeatureFlagStore = create<FeatureFlagState>((set) => ({
  flags: {},
  resolvedAt: null,
  setFlags: (flags) => set({ flags, resolvedAt: Date.now() }),
  reset: () => set({ flags: {}, resolvedAt: null }),
}));
