import * as React from 'react';
import { Menu, X, User } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  sidebarNav: React.ReactNode;
  topbarRight?: React.ReactNode;
  appName?: string;
}

export function AppShell({ children, sidebarNav, topbarRight, appName = 'EasyDev Support AI' }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-50 text-neutral-900 font-sans">
      
      {/* 1. Desktop Sidebar (always visible on desktop, hidden on mobile) */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-neutral-200 md:bg-white md:px-4 md:py-6">
        <div className="mb-8 flex items-center px-2">
          <span className="text-lg font-bold tracking-tight text-primary-500">{appName}</span>
        </div>
        <nav className="flex-1 space-y-1">{sidebarNav}</nav>
      </aside>

      {/* 2. Mobile Drawer Sidebar (slide-over layout overlay) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          
          <aside className="relative flex w-64 max-w-xs flex-col bg-white px-4 py-6 shadow-xl animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute right-4 top-4 text-neutral-500 hover:text-neutral-900"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="mb-8 flex items-center px-2">
              <span className="text-lg font-bold tracking-tight text-primary-500">{appName}</span>
            </div>
            <nav className="flex-1 space-y-1">{sidebarNav}</nav>
          </aside>
        </div>
      )}

      {/* 3. Main Frame */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* 3.1 Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-neutral-500 hover:text-neutral-900 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            {topbarRight}
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-neutral-200 text-neutral-700">
              <User className="h-4 w-4" />
            </div>
          </div>
        </header>

        {/* 3.2 Main Content View */}
        <main className="flex-1 overflow-y-auto p-6 focus:outline-none" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
