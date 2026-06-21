import { create } from 'zustand';
import { Customer, CustomerNote } from '../types';

interface CustomerState {
  customers: Record<string, Customer>;
  setCustomer: (id: string, customer: Customer) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  addNote: (customerId: string, note: CustomerNote) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: {},
  setCustomer: (id, customer) =>
    set((state) => ({
      customers: { ...state.customers, [id]: customer },
    })),
  updateCustomer: (id, updates) =>
    set((state) => {
      const existing = state.customers[id];
      if (!existing) return {};
      return {
        customers: {
          ...state.customers,
          [id]: { ...existing, ...updates },
        },
      };
    }),
  addNote: (customerId, note) =>
    set((state) => {
      const customer = state.customers[customerId];
      if (!customer) return {};
      return {
        customers: {
          ...state.customers,
          [customerId]: { ...customer, notes: [note, ...customer.notes] },
        },
      };
    }),
}));
