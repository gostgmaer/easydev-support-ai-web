import { create } from 'zustand';
import type { Tenant, TenantMembership } from '@easydev/types';

export interface TenantState {
  current: Tenant | null;
  available: TenantMembership[];
  switching: boolean;
  setCurrent: (tenant: Tenant) => void;
  setAvailable: (memberships: TenantMembership[]) => void;
  setSwitching: (switching: boolean) => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  current: null,
  available: [],
  switching: false,
  setCurrent: (tenant) => set({ current: tenant }),
  setAvailable: (memberships) => set({ available: memberships }),
  setSwitching: (switching) => set({ switching }),
}));
