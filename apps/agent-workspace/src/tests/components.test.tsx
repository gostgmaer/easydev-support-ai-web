import React from 'react';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../components/sidebar';
import { Topbar } from '../components/topbar';
import { useRealtimeStore } from '@easydev/realtime';
import { useNotificationStore } from '../store/notificationStore';

// Mock NextJS navigation routers
jest.mock('next/navigation', () => ({
  usePathname: () => '/inbox',
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

describe('Component & Accessibility Tests', () => {
  test('should render Sidebar links and match keyboard shortcut accessibility cues', () => {
    useNotificationStore.setState({ unreadCount: 5 });
    render(<Sidebar />);
    
    // Check navigation shortcuts and labels exist
    const myInboxBtn = screen.getByRole('button', { name: /my conversations/i });
    expect(myInboxBtn).toBeInTheDocument();
    expect(myInboxBtn).toHaveAttribute('aria-label', 'My Conversations (G M)');

    // Verify unread badge count reflects notification state
    const notificationBadge = screen.getByText('5');
    expect(notificationBadge).toBeInTheDocument();
  });

  test('should render Topbar and display correct socket connection state badge', () => {
    // 1. Assert Disconnected layout
    useRealtimeStore.setState({ connected: false });
    const { rerender } = render(<Topbar onSearchClick={jest.fn()} />);
    
    expect(screen.getByText(/disconnected/i)).toBeInTheDocument();

    // 2. Assert Connected layout
    useRealtimeStore.setState({ connected: true });
    rerender(<Topbar onSearchClick={jest.fn()} />);
    
    expect(screen.getByText(/realtime connected/i)).toBeInTheDocument();
  });

  test('should verify select accessibility tags inside Topbar presence dropdown', () => {
    render(<Topbar onSearchClick={jest.fn()} />);
    
    const selectEl = screen.getByRole('combobox', { name: /set agent status/i });
    expect(selectEl).toBeInTheDocument();
    expect(selectEl).toHaveValue('online');
  });
});
