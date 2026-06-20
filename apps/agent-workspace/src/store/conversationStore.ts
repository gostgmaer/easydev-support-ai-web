import { create } from 'zustand';
import { Message, AiDraft } from '../types';

interface ConversationState {
  messages: Record<string, Message[]>;
  typingStates: Record<string, Record<string, { name: string; timestamp: number }>>;
  drafts: Record<string, string>;
  aiDrafts: Record<string, AiDraft | null>;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  setTyping: (conversationId: string, userId: string, name: string, isTyping: boolean) => void;
  setDraft: (conversationId: string, content: string) => void;
  setAiDraft: (conversationId: string, draft: AiDraft | null) => void;
  updateMessageReaction: (
    conversationId: string,
    messageId: string,
    emoji: string,
    userId: string,
    action: 'add' | 'remove'
  ) => void;
  updateMessageReadReceipts: (
    conversationId: string,
    messageId: string,
    receipts: { userId: string; timestamp: string }[]
  ) => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  messages: {},
  typingStates: {},
  drafts: {},
  aiDrafts: {},
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),
  addMessage: (conversationId, message) =>
    set((state) => {
      const prevMessages = state.messages[conversationId] || [];
      // avoid duplicates
      if (prevMessages.some((m) => m.id === message.id)) return {};
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...prevMessages, message],
        },
      };
    }),
  setTyping: (conversationId, userId, name, isTyping) =>
    set((state) => {
      const prevTyping = state.typingStates[conversationId] || {};
      const newTyping = { ...prevTyping };
      if (isTyping) {
        newTyping[userId] = { name, timestamp: Date.now() };
      } else {
        delete newTyping[userId];
      }
      return {
        typingStates: {
          ...state.typingStates,
          [conversationId]: newTyping,
        },
      };
    }),
  setDraft: (conversationId, content) =>
    set((state) => ({
      drafts: { ...state.drafts, [conversationId]: content },
    })),
  setAiDraft: (conversationId, draft) =>
    set((state) => ({
      aiDrafts: { ...state.aiDrafts, [conversationId]: draft },
    })),
  updateMessageReaction: (conversationId, messageId, emoji, userId, action) =>
    set((state) => {
      const convMessages = state.messages[conversationId] || [];
      const updated = convMessages.map((m) => {
        if (m.id !== messageId) return m;
        const reactions = m.reactions ? [...m.reactions] : [];
        const existingIdx = reactions.findIndex((r) => r.emoji === emoji);

        if (action === 'add') {
          if (existingIdx > -1) {
            const reaction = reactions[existingIdx];
            if (!reaction.users.includes(userId)) {
              reactions[existingIdx] = {
                ...reaction,
                users: [...reaction.users, userId],
              };
            }
          } else {
            reactions.push({ emoji, users: [userId] });
          }
        } else {
          if (existingIdx > -1) {
            const reaction = reactions[existingIdx];
            const users = reaction.users.filter((uid) => uid !== userId);
            if (users.length === 0) {
              reactions.splice(existingIdx, 1);
            } else {
              reactions[existingIdx] = { ...reaction, users };
            }
          }
        }
        return { ...m, reactions };
      });
      return {
        messages: {
          ...state.messages,
          [conversationId]: updated,
        },
      };
    }),
  updateMessageReadReceipts: (conversationId, messageId, receipts) =>
    set((state) => {
      const convMessages = state.messages[conversationId] || [];
      const updated = convMessages.map((m) => {
        if (m.id !== messageId) return m;
        return { ...m, readReceipts: receipts };
      });
      return {
        messages: {
          ...state.messages,
          [conversationId]: updated,
        },
      };
    }),
}));
