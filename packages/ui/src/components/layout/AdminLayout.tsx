import * as React from 'react';
import { AppShell } from './AppShell';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { PageContainer } from './PageContainer';

export interface AdminLayoutProps {
  navigation: React.ReactNode;
  orgSwitcher?: React.ReactNode;
  userMenu?: React.ReactNode;
  pageActions?: React.ReactNode;
  children: React.ReactNode;
}

export function AdminLayout({ navigation, orgSwitcher, userMenu, pageActions, children }: AdminLayoutProps) {
  return (
    <AppShell
      sidebar={
        <Sidebar header={orgSwitcher} width="default">
          {navigation}
        </Sidebar>
      }
      topbar={<Topbar end={<div className="flex items-center gap-2">{pageActions}{userMenu}</div>} />}
    >
      <PageContainer width="wide">{children}</PageContainer>
    </AppShell>
  );
}
