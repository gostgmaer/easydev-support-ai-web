import { useInboxStore } from '../store/inboxStore';
import { Conversation } from '../types';

const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    tenantId: 'tenant-1',
    customerId: 'cust-1',
    customerName: 'Alice',
    status: 'open',
    priority: 'high',
    subject: 'Issue with login',
    updatedAt: new Date().toISOString(),
    unreadCount: 2,
    aiStatus: 'active',
  },
  {
    id: 'conv-2',
    tenantId: 'tenant-1',
    customerId: 'cust-2',
    customerName: 'Bob',
    status: 'snoozed',
    priority: 'low',
    subject: 'Billing inquiry',
    updatedAt: new Date().toISOString(),
    unreadCount: 0,
    aiStatus: 'paused',
  },
];

describe('InboxStore Unit Tests', () => {
  beforeEach(() => {
    useInboxStore.setState({
      selectedView: 'my',
      filters: {},
      selectedConversationIds: [],
      activeConversationId: null,
      conversations: [],
    });
  });

  test('should initialize with default states', () => {
    const state = useInboxStore.getState();
    expect(state.selectedView).toBe('my');
    expect(state.selectedConversationIds).toEqual([]);
    expect(state.activeConversationId).toBeNull();
  });

  test('should change selected view and clear selection list', () => {
    useInboxStore.setState({ selectedConversationIds: ['conv-1'] });
    useInboxStore.getState().setSelectedView('unassigned');
    
    expect(useInboxStore.getState().selectedView).toBe('unassigned');
    expect(useInboxStore.getState().selectedConversationIds).toEqual([]);
  });

  test('should update inbox filters', () => {
    useInboxStore.getState().updateFilters({ status: ['open'] });
    expect(useInboxStore.getState().filters.status).toEqual(['open']);
  });

  test('should toggle selection for conversations', () => {
    useInboxStore.getState().toggleSelectConversation('conv-1');
    expect(useInboxStore.getState().selectedConversationIds).toContain('conv-1');

    useInboxStore.getState().toggleSelectConversation('conv-1');
    expect(useInboxStore.getState().selectedConversationIds).not.toContain('conv-1');
  });

  test('should set and update conversation item states optimistically', () => {
    useInboxStore.getState().setConversations(mockConversations);
    expect(useInboxStore.getState().conversations.length).toBe(2);

    useInboxStore.getState().updateConversation('conv-1', { status: 'resolved' });
    const updated = useInboxStore.getState().conversations.find(c => c.id === 'conv-1');
    expect(updated?.status).toBe('resolved');
  });
});
