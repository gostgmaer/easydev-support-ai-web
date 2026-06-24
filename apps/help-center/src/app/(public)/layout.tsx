'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@easydev/auth';
import { useTenantBranding } from '@easydev/design-system';
import {
  Search,
  BookOpen,
  HelpCircle,
  Activity,
  FileText,
  MessageSquare,
  Menu,
  X,
  User,
  LogOut,
  ChevronRight,
  Home,
} from 'lucide-react';
import { Input, Button } from '@easydev/ui';

export default function PublicPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { branding } = useTenantBranding();

  const [searchVal, setSearchVal] = React.useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const widgetEmbedUrl = process.env.NEXT_PUBLIC_WIDGET_EMBED_URL;
  const widgetTenantId = process.env.NEXT_PUBLIC_WIDGET_TENANT_ID;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Browse Categories', href: '/categories', icon: BookOpen },
    { label: 'FAQs', href: '/faq', icon: HelpCircle },
    { label: 'Release Notes', href: '/release-notes', icon: FileText },
    { label: 'System Status', href: '/status', icon: Activity },
  ];

  // Breadcrumbs resolver based on pathname
  const breadcrumbs = React.useMemo(() => {
    if (pathname === '/') return null;
    const parts = pathname.split('/').filter(Boolean);
    return (
      <nav className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-400 py-3 select-none">
        <Link href="/" className="hover:text-neutral-600 flex items-center gap-1">
          <Home className="h-3 w-3" />
          <span>Home</span>
        </Link>
        {parts.map((part, index) => {
          const href = '/' + parts.slice(0, index + 1).join('/');
          const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
          const isLast = index === parts.length - 1;

          return (
            <React.Fragment key={href}>
              <ChevronRight className="h-3 w-3 text-neutral-300" />
              {isLast ? (
                <span className="text-neutral-600 font-semibold truncate max-w-[150px]">
                  {label}
                </span>
              ) : (
                <Link href={href} className="hover:text-neutral-600 truncate max-w-[120px]">
                  {label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  }, [pathname]);

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col font-sans text-xs antialiased selection:bg-primary-100">
      {/* 1. Header component */}
      <header className="sticky top-0 bg-white border-b border-neutral-100 z-50 shadow-3xs shrink-0">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            {branding?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- tenant-supplied URL, not a static asset Next's image optimizer can use
              <img src={branding.logoUrl} alt="" className="h-7 w-7 rounded object-contain" />
            ) : (
              <div className="h-7 w-7 bg-neutral-900 text-white rounded flex items-center justify-center font-bold text-sm tracking-wider">
                ED
              </div>
            )}
            <span className="font-bold text-neutral-900 text-sm tracking-tight group-hover:text-neutral-700 transition">
              EasyDev Help Center
            </span>
          </Link>

          {/* Search bar inside header (only visible if not on Home page) */}
          {pathname !== '/' && (
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-sm relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <Input
                value={searchVal}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchVal(e.target.value)}
                placeholder="Search self-service articles..."
                className="pl-9 h-9 text-xs bg-neutral-50/50 border-neutral-200/80 focus:bg-white"
              />
            </form>
          )}

          {/* Desktop Navigation links */}
          <nav className="hidden lg:flex items-center gap-5 text-neutral-600 font-semibold">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-neutral-900 transition-colors ${
                  pathname.startsWith(link.href) ? 'text-neutral-950 font-bold' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Support Actions & Auth controls */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/contact-support">
              <Button size="sm" variant="outline" className="text-xs font-bold flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Contact Support</span>
              </Button>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 border-l border-neutral-100 pl-3">
                <Link href="/account" className="flex items-center gap-1.5 hover:text-neutral-800 font-semibold">
                  <div className="h-6 w-6 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="max-w-[80px] truncate text-[11px]">{user?.displayName}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 text-neutral-400 hover:text-neutral-600 transition"
                  aria-label="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="border-l border-neutral-100 pl-3">
                <Button size="sm" className="bg-neutral-800 text-white hover:bg-neutral-950 text-xs font-bold">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-500 hover:text-neutral-800 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer view */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-64 bg-white h-full p-5 space-y-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-250">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-xs uppercase tracking-wider">Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 hover:bg-neutral-50 rounded"
                >
                  <X className="h-4 w-4 text-neutral-400" />
                </button>
              </div>

              <nav className="flex flex-col gap-4 font-semibold text-neutral-600">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 py-1.5 hover:text-neutral-950"
                    >
                      <Icon className="h-4 w-4 text-neutral-400" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-neutral-100 pt-4 space-y-3 shrink-0">
              <Link href="/contact-support" onClick={() => setMobileMenuOpen(false)} className="block">
                <Button variant="outline" className="w-full text-xs font-bold flex items-center justify-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Contact Support</span>
                </Button>
              </Link>
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 py-1 hover:text-neutral-800 font-semibold"
                  >
                    <User className="h-4.5 w-4.5 text-neutral-400" />
                    <span>My Account</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 py-1 text-danger-600 hover:text-danger-700 font-semibold w-full text-left"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button className="w-full bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Main content viewport */}
      <main className="flex-1 min-h-0 py-2">
        <div className="max-w-6xl mx-auto px-4">
          {breadcrumbs}
          {children}
        </div>
      </main>

      {/* 3. Footer component */}
      <footer className="border-t border-neutral-150 bg-white py-8 mt-12 shrink-0">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <span className="font-bold text-neutral-900 text-xs tracking-wider">EASYDEV PLATFORM</span>
            <p className="text-neutral-500 leading-relaxed text-[11px] font-normal">
              Empowering customer self-service with AI deflection models and realtime human handoff support.
            </p>
          </div>

          <div className="space-y-2.5">
            <span className="font-bold text-neutral-800 text-[10px] uppercase tracking-wider block">Support Pages</span>
            <ul className="space-y-1.5 font-medium text-neutral-500">
              <li>
                <Link href="/categories" className="hover:text-neutral-800 transition">
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-neutral-800 transition">
                  FAQ Database
                </Link>
              </li>
              <li>
                <Link href="/contact-support" className="hover:text-neutral-800 transition">
                  Submit a Case
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <span className="font-bold text-neutral-800 text-[10px] uppercase tracking-wider block">Information</span>
            <ul className="space-y-1.5 font-medium text-neutral-500">
              <li>
                <Link href="/release-notes" className="hover:text-neutral-800 transition">
                  Product Updates
                </Link>
              </li>
              <li>
                <Link href="/status" className="hover:text-neutral-800 transition">
                  System Status
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <span className="font-bold text-neutral-800 text-[10px] uppercase tracking-wider block">Security & Legal</span>
            <ul className="space-y-1.5 font-medium text-neutral-500">
              <li>
                <Link href="/privacy" className="hover:text-neutral-800 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-neutral-800 transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-8 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-neutral-400">
          <span>&copy; {new Date().getFullYear()} EasyDev Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/status" className="hover:text-neutral-500 transition flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-success-500 animate-pulse" />
              <span className="font-semibold text-[10px]">All Systems Operational</span>
            </Link>
          </div>
        </div>
      </footer>

      {/* 4. Live Chat Widget Launcher integration */}
      {/* Inserts the embedded chat launcher referencing our customer widget iframe.
          Both values are deployment-specific (one help-center deployment serves one
          tenant) - omit the script entirely rather than fall back to a fake/dev
          tenant ID when they aren't configured. */}
      {widgetEmbedUrl && widgetTenantId && (
        <script src={widgetEmbedUrl} data-tenant-id={widgetTenantId} defer />
      )}
    </div>
  );
}
