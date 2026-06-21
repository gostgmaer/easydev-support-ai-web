'use client';

import * as React from 'react';
import { useReleaseNotes, ReleaseNote } from '@/hooks/useHelpQueries';
import { Calendar, Tag, ShieldCheck, ChevronRight } from 'lucide-react';
import { Spinner, Badge } from '@easydev/ui';

export default function ReleaseNotesTimelinePage() {
  const { data: releaseNotes, isLoading, error } = useReleaseNotes();

  const mockReleaseNotes: ReleaseNote[] = [
    {
      id: 'rel-1',
      version: 'v2.4.0',
      date: '2026-06-15T09:00:00Z',
      title: 'Shopify Connector upgrade and custom Webhook controls',
      description: 'We have updated our backend connector layers to sync order changes faster and provide direct webhook auditing screens.',
      updates: [
        { type: 'feature', content: 'Added automatic Shopify multi-currency invoice sync matching localized customer accounts.' },
        { type: 'feature', content: 'Introduced webhook triggers for returns slip PDF generation events.' },
        { type: 'bugfix', content: 'Fixed a race condition causing duplicate message socket events during heavy socket reconnections.' },
      ],
    },
    {
      id: 'rel-2',
      version: 'v2.3.5',
      date: '2026-05-22T08:00:00Z',
      title: 'Self-service AI deflection score tracking',
      description: 'Support managers can now track the effectiveness of AI suggested questions using custom deflection dashboards.',
      updates: [
        { type: 'feature', content: 'Added AI deflection metrics charts inside the Admin Workspace portal.' },
        { type: 'bugfix', content: 'Resolved focus trap accessibility bugs in radical dropdown portals.' },
        { type: 'announcement', content: 'Scheduled maintenance for migration of DB instances on June 28th.' },
      ],
    },
  ];

  const activeNotes = (releaseNotes && releaseNotes.length > 0) || error ? mockReleaseNotes : releaseNotes;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center py-16 bg-neutral-50/50">
        <Spinner className="h-6 w-6 text-neutral-400" />
      </div>
    );
  }

  const getUpdateTypeTone = (type: string) => {
    switch (type) {
      case 'feature':
        return 'success';
      case 'bugfix':
        return 'warning';
      case 'announcement':
        return 'primary';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Title bar */}
      <div className="border-b border-neutral-100 pb-3">
        <h1 className="text-xl font-extrabold text-neutral-900">Product Release Notes</h1>
        <p className="text-neutral-500 mt-1">Timeline of features, updates, bug fixes, and system improvements.</p>
      </div>

      {!activeNotes || activeNotes.length === 0 ? (
        <div className="p-8 text-center border border-neutral-200 rounded-xl bg-white space-y-2">
          <Calendar className="h-8 w-8 text-neutral-300 mx-auto" />
          <p className="font-bold text-neutral-800">No updates posted</p>
          <p className="text-neutral-400 text-[10px]">Product release updates will be listed here.</p>
        </div>
      ) : (
        /* Timeline container */
        <div className="relative border-l border-neutral-200 ml-4 pl-6 space-y-8">
          {activeNotes.map((note: any) => (
            <div key={note.id} className="relative space-y-3">
              {/* Timeline bubble node */}
              <div className="absolute -left-[31px] top-1.5 h-4.5 w-4.5 bg-neutral-900 border-4 border-white text-white rounded-full flex items-center justify-center font-bold text-[9px] shadow-3xs" />

              {/* Version & Date */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-400 font-semibold">
                <span className="text-neutral-900 font-extrabold text-sm">{note.version}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                  <span>{new Date(note.date).toLocaleDateString()}</span>
                </span>
              </div>

              {/* Detail Card */}
              <div className="p-5 border border-neutral-200 bg-white rounded-xl shadow-3xs space-y-4">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-neutral-800 text-xs leading-snug">{note.title}</h3>
                  <p className="text-neutral-400 text-[11px] leading-relaxed font-normal">{note.description}</p>
                </div>

                {/* Sub-updates checklist */}
                {note.updates && note.updates.length > 0 && (
                  <div className="space-y-2.5 pt-3.5 border-t border-neutral-100">
                    {note.updates.map((up: any, i: number) => (
                      <div key={i} className="flex gap-2.5 items-start text-[11px] font-normal leading-relaxed text-neutral-600">
                        <Badge tone={getUpdateTypeTone(up.type)} className="text-[8px] uppercase tracking-wider font-bold shrink-0 mt-0.5">
                          {up.type}
                        </Badge>
                        <span>{up.content}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
