'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RequireAuth, useAuth } from '@easydev/auth';
import { useTenantStore } from '@easydev/stores';
import { AdminLayout } from '@easydev/ui';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  ShieldCheck,
  Cpu,
  Database,
  Radio,
  Workflow,
  Settings,
  CreditCard,
  Key,
  Webhook,
  Activity,
  User
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { tenant, logout, switchTenant } = useAuth();
  const availableTenants = useTenantStore((state) => state.available);
  const switching = useTenantStore((state) => state.switching);

  const handleSwitchTenant = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const tenantId = event.target.value;
    if (!tenantId || tenantId === tenant?.id) return;
    try {
      await switchTenant(tenantId);
    } catch {
      // RequireAuth/session listeners surface auth failures elsewhere; this
      // switcher just needs to not crash the layout on a failed switch.
    }
  };

  const navigationItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics & Reports', href: '/analytics', icon: BarChart3 },
    { label: 'Teams & Agents', href: '/teams', icon: Users },
    { label: 'Channels', href: '/channels', icon: Radio },
    { label: 'Connectors', href: '/connectors', icon: Database },
    { label: 'Knowledge Base', href: '/knowledge', icon: ShieldCheck },
    { label: 'AI Management', href: '/ai', icon: Cpu },
    { label: 'Workflows', href: '/workflows', icon: Workflow },
    { label: 'Security & API Keys', href: '/api-keys', icon: Key },
    { label: 'Webhooks & Audits', href: '/webhooks', icon: Webhook },
    { label: 'System Health & Ops', href: '/system-health', icon: Activity },
    { label: 'Billing & Subscriptions', href: '/billing', icon: CreditCard },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const sidebarNavigation = (
    <nav className="flex flex-col gap-1 p-3" aria-label="Admin Navigation">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="h-4.5 w-4.5 flex-shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const orgSwitcher = (
    <div className="flex items-center justify-between w-full p-3 bg-neutral-50 border-b border-neutral-200">
      <div className="flex flex-col text-left">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">Active Tenant</span>
        <span className="text-xs font-extrabold text-neutral-800 truncate mt-1 max-w-[150px]">{tenant?.name || 'Default Org'}</span>
      </div>
      {availableTenants.length > 1 && (
        <select
          value={tenant?.id ?? ''}
          onChange={handleSwitchTenant}
          disabled={switching}
          className="border border-neutral-200 rounded p-1 bg-white text-[10px] font-bold cursor-pointer disabled:opacity-50"
          aria-label="Tenant switcher"
        >
          {availableTenants.map((membership) => (
            <option key={membership.tenant.id} value={membership.tenant.id}>
              {membership.tenant.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );

  const userMenu = (
    <div className="flex items-center gap-2">
      <Link href="/profile" className="p-1 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900" title="Profile">
        <User className="h-5 w-5" />
      </Link>
      <button
        onClick={() => logout()}
        className="rounded border border-neutral-200 bg-white hover:bg-neutral-50 px-2.5 py-1 text-xs font-bold text-neutral-700"
        aria-label="Sign out"
      >
        Sign Out
      </button>
    </div>
  );

  return (
    <RequireAuth loadingFallback={<main className="p-8 text-sm text-neutral-500">Loading auth guard...</main>}>
      <AdminLayout
        navigation={sidebarNavigation}
        orgSwitcher={orgSwitcher}
        userMenu={userMenu}
      >
        {children}
      </AdminLayout>
    </RequireAuth>
  );
}
