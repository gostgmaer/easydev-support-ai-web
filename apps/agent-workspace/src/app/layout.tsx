import React from 'react';
import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'EasyDev Support AI - Agent Workspace',
  description: 'Primary workspace application used by support agents.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased text-neutral-900 bg-neutral-50 overflow-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
