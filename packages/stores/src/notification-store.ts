import { create } from 'zustand';
import type { NotificationItem } from '@easydev/types';

export interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  add: (item: NotificationItem) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  unreadCount: 0,
  add: (item) => {
    const items = [item, ...get().items].slice(0, 200);
    set({ items, unreadCount: items.filter((i) => !i.read).length });
  },
  markRead: (id) => {
    const items = get().items.map((item) => (item.id === id ? { ...item, read: true } : item));
    set({ items, unreadCount: items.filter((i) => !i.read).length });
  },
  markAllRead: () => {
    const items = get().items.map((item) => ({ ...item, read: true }));
    set({ items, unreadCount: 0 });
  },
  clear: () => set({ items: [], unreadCount: 0 }),
}));
