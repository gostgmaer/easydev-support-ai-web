import { useConversationStore } from '../store/conversationStore';
import { Message } from '../types';

const mockMessage: Message = {
  id: 'msg-1',
  conversationId: 'conv-100',
  senderId: 'cust-10',
  senderName: 'Alice',
  senderType: 'customer',
  content: 'Hello, help me please',
  isInternalNote: false,
  createdAt: new Date().toISOString(),
};

describe('ConversationStore Unit Tests', () => {
  beforeEach(() => {
    useConversationStore.setState({
      messages: {},
      typingStates: {},
      drafts: {},
      aiDrafts: {},
    });
  });

  test('should set messages for a conversation room', () => {
    useConversationStore.getState().setMessages('conv-100', [mockMessage]);
    expect(useConversationStore.getState().messages['conv-100']).toEqual([mockMessage]);
  });

  test('should append new message to conversation stream without duplicates', () => {
    useConversationStore.getState().addMessage('conv-100', mockMessage);
    expect(useConversationStore.getState().messages['conv-100'].length).toBe(1);

    // duplicate append check
    useConversationStore.getState().addMessage('conv-100', mockMessage);
    expect(useConversationStore.getState().messages['conv-100'].length).toBe(1);
  });

  test('should toggle typing state indicators', () => {
    useConversationStore.getState().setTyping('conv-100', 'agent-1', 'Agent John', true);
    expect(useConversationStore.getState().typingStates['conv-100']['agent-1'].name).toBe('Agent John');

    useConversationStore.getState().setTyping('conv-100', 'agent-1', 'Agent John', false);
    expect(useConversationStore.getState().typingStates['conv-100']['agent-1']).toBeUndefined();
  });

  test('should save compose draft contents per conversation room', () => {
    useConversationStore.getState().setDraft('conv-100', 'My response draft');
    expect(useConversationStore.getState().drafts['conv-100']).toBe('My response draft');
  });

  test('should update message reactions list optimistically', () => {
    useConversationStore.getState().setMessages('conv-100', [mockMessage]);
    
    // Add reaction
    useConversationStore.getState().updateMessageReaction('conv-100', 'msg-1', '👍', 'agent-1', 'add');
    let message = useConversationStore.getState().messages['conv-100'][0];
    expect(message.reactions?.[0].emoji).toBe('👍');
    expect(message.reactions?.[0].users).toContain('agent-1');

    // Remove reaction
    useConversationStore.getState().updateMessageReaction('conv-100', 'msg-1', '👍', 'agent-1', 'remove');
    message = useConversationStore.getState().messages['conv-100'][0];
    expect(message.reactions?.length).toBe(0);
  });
});
