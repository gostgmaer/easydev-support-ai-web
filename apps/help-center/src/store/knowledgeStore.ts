import { create } from 'zustand';

export interface HelpCategory {
  id: string;
  name: string;
  description: string;
  parentCategoryId: string | null;
  sortOrder: number;
}

interface KnowledgeState {
  categories: HelpCategory[];
  setCategories: (categories: HelpCategory[]) => void;
}

export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  categories: [],
  setCategories: (categories) => set({ categories }),
}));
