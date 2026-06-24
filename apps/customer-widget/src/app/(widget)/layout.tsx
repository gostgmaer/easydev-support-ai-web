'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, FileQuestion, StickyNote, History } from 'lucide-react';
import { Avatar } from '@easydev/ui';
import { useWidgetStore } from '../../store/widgetStore';
import { useEnsureWidgetSession, useWidgetBranding } from '../../hooks/useWidgetQueries';

export default function WidgetWindowLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const config = useWidgetStore((state) => state.config);
  const sessionToken = useWidgetStore((state) => state.sessionToken);
  // Public, no session token required - loads independently of (and usually
  // before) the session bootstrap below so real tenant branding shows up
  // immediately instead of the generic local defaults the whole time.
  useWidgetBranding();
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

  // children (the chat/help/tickets/history pages) call conversation and
  // message hooks that authenticate with this session token - mounting them
  // before it exists sends those requests with no Authorization header at
  // all, 401ing with "Missing Tenant ID or session token" even though the
  // session bootstrap above is genuinely still in flight, not failed.
  if (!sessionToken) {
    return (
      <div
        className="w-full max-w-md h-[600px] border border-neutral-200 bg-white rounded-xl shadow-2xl flex items-center justify-center"
        role="region"
        aria-label="Customer Support Widget"
      >
        <div className="h-6 w-6 rounded-full border-2 border-neutral-200 border-t-primary-500 animate-spin" />
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
            <div className="flex items-center gap-1.5">
              {config.tenantLogo && (
                // eslint-disable-next-line @next/next/no-img-element -- tenant-supplied URL, not a static asset Next's image optimizer can use
                <img src={config.tenantLogo} alt="" className="h-3.5 w-3.5 rounded-sm object-contain bg-white/10" />
              )}
              <h2 className="text-xs font-bold leading-none">{config.aiName}</h2>
            </div>
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
