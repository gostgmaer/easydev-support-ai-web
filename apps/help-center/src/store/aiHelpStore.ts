import { create } from 'zustand';
import { HelpArticleSummary } from './searchStore';

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  confidenceScore?: number;
  recommendedArticles?: HelpArticleSummary[];
  createdAt: string;
}

interface AIHelpState {
  chatHistory: AIMessage[];
  isAskingAI: boolean;
  suggestedQuestions: string[];
  escalationTriggered: boolean;

  addAIMessage: (msg: AIMessage) => void;
  setAskingAI: (asking: boolean) => void;
  setSuggestedQuestions: (questions: string[]) => void;
  setEscalationTriggered: (triggered: boolean) => void;
  clearAIChat: () => void;
}

export const useAIHelpStore = create<AIHelpState>((set) => ({
  chatHistory: [],
  isAskingAI: false,
  suggestedQuestions: [
    'How do I cancel my order?',
    'What is your refund policy?',
    'How long does standard shipping take?',
  ],
  escalationTriggered: false,

  addAIMessage: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
  setAskingAI: (isAskingAI) => set({ isAskingAI }),
  setSuggestedQuestions: (suggestedQuestions) => set({ suggestedQuestions }),
  setEscalationTriggered: (escalationTriggered) => set({ escalationTriggered }),
  clearAIChat: () => set({ chatHistory: [], escalationTriggered: false }),
}));
