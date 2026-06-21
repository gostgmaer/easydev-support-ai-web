'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, FileQuestion, StickyNote, History } from 'lucide-react';
import { Avatar } from '@easydev/ui';
import { useWidgetStore } from '../../store/widgetStore';
import { useEnsureWidgetSession } from '../../hooks/useWidgetQueries';

export default function WidgetWindowLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const config = useWidgetStore((state) => state.config);
  // Bootstraps the anonymous visitor's session token once tenantId is known
  // (set by Providers' TenantIdSync) - every widget API/socket call needs it.
  // Can fail with 403 if the tenant has locked down embedding to specific
  // domains and this page wasn't loaded from one of them - surface that
  // instead of leaving the visitor staring at an infinite spinner.
  const { isError: sessionFailed } = useEnsureWidgetSession();

  const navItems = [
    { label: 'Home', href: '/widget', icon: MessageCircle },
    { label: 'Docs', href: '/help', icon: FileQuestion },
    { label: 'Tickets', href: '/tickets', icon: StickyNote },
    { label: 'History', href: '/history', icon: History },
  ];

  if (sessionFailed) {
    return (
      <div
        className="w-full max-w-md h-[600px] border border-neutral-200 bg-white rounded-xl shadow-2xl flex items-center justify-center p-6 text-center"
        role="region"
        aria-label="Customer Support Widget"
      >
        <p className="text-xs font-semibold text-neutral-500">
          This support widget isn&apos;t available here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md h-[600px] border border-neutral-200 bg-white rounded-xl shadow-2xl flex flex-col justify-between overflow-hidden relative" role="region" aria-label="Customer Support Widget">
      {/* Widget Header */}
      <header
        style={{ backgroundColor: config.primaryColor }}
        className="px-5 py-4 text-white flex items-center justify-between shadow-sm z-10 flex-shrink-0"
      >
        <div className="flex items-center gap-3">
          <Avatar
            src={config.agentAvatar}
            name={config.aiName}
            size="sm"
            className="border-2 border-white/80"
          />
          <div>
            <h2 className="text-xs font-bold leading-none">{config.aiName}</h2>
            <span className="text-[10px] text-white/80 mt-1 block">Typically replies instantly</span>
          </div>
        </div>

        {/* Fullscreen indicator details */}
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
          <span className="text-[9px] uppercase font-bold tracking-wider text-white/80">Support Active</span>
        </div>
      </header>

      {/* Widget Body viewport */}
      <main className="flex-1 overflow-hidden relative bg-neutral-50/50">
        {children}
      </main>

      {/* Widget Footer Navigation bar */}
      <footer className="h-14 border-t border-neutral-100 bg-white flex items-center justify-around px-4 flex-shrink-0 z-10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === '/widget' && pathname === '/chat');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1.5 transition-all focus:outline-none ${
                isActive ? 'text-primary-500 font-bold' : 'text-neutral-400 hover:text-neutral-600'
              }`}
              style={isActive ? { color: config.primaryColor } : undefined}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] uppercase tracking-wider font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </footer>
    </div>
  );
}
