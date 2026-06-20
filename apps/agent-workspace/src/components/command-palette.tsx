import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Inbox, AlertTriangle, User, Settings, CheckSquare, Sparkles } from 'lucide-react';
import { useInboxStore } from '../store/inboxStore';

interface CommandItem {
  id: string;
  title: string;
  category: 'Actions' | 'Navigation' | 'Help';
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const setSelectedView = useInboxStore((state) => state.setSelectedView);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'go-my',
      title: 'Go to My Conversations',
      category: 'Navigation',
      icon: User,
      action: () => {
        setSelectedView('my');
        router.push('/inbox');
      },
    },
    {
      id: 'go-unassigned',
      title: 'Go to Unassigned Inbox',
      category: 'Navigation',
      icon: Inbox,
      action: () => {
        setSelectedView('unassigned');
        router.push('/inbox');
      },
    },
    {
      id: 'go-escalated',
      title: 'Go to Escalated Inbox',
      category: 'Navigation',
      icon: AlertTriangle,
      action: () => {
        setSelectedView('escalated');
        router.push('/inbox');
      },
    },
    {
      id: 'go-settings',
      title: 'Go to Settings',
      category: 'Navigation',
      icon: Settings,
      action: () => router.push('/settings'),
    },
    {
      id: 'cmd-takeover',
      title: 'Take Over Conversation from AI',
      category: 'Actions',
      icon: Sparkles,
      action: () => {
        // Optimistic toggle will handle active conversation takeover
        alert('AI Takeover command executed');
      },
    },
    {
      id: 'cmd-create-ticket',
      title: 'Create Ticket from Active Conversation',
      category: 'Actions',
      icon: CheckSquare,
      action: () => {
        alert('Create ticket request initiated');
      },
    },
  ];

  const filteredCommands = commands.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Reset index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-neutral-900/60 z-[2000] flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cmd-search-input"
    >
      <div
        className="w-full max-w-xl bg-white rounded-lg shadow-2xl border border-neutral-200 overflow-hidden flex flex-col focus:outline-none"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 bg-neutral-50">
          <Search className="h-5 w-5 text-neutral-400" />
          <input
            id="cmd-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a command or route to navigate..."
            className="flex-1 bg-transparent text-sm text-neutral-900 border-none outline-none focus:ring-0 placeholder:text-neutral-400"
            autoFocus
            aria-autocomplete="list"
          />
        </div>

        {/* Results List */}
        <div className="max-h-[300px] overflow-y-auto p-2 space-y-1" ref={listRef}>
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, idx) => {
              const Icon = command.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={command.id}
                  onClick={() => {
                    command.action();
                    onClose();
                  }}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-md text-sm transition-all text-left ${
                    isSelected ? 'bg-primary-500 text-white' : 'hover:bg-neutral-100 text-neutral-700'
                  }`}
                  aria-selected={isSelected}
                  role="option"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                    <span>{command.title}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-primary-100' : 'text-neutral-400'}`}>
                    {command.category}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-sm text-neutral-400">No commands found.</div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center text-[10px] text-neutral-500 font-semibold">
          <div className="flex gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
}
