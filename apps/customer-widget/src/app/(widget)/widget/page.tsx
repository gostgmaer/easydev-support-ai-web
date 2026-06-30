'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useWidgetStore } from '../../../store/widgetStore';
import { useResumeWidgetConversation, useStartWidgetConversation, useVerifyWidgetIdentity, useCaptureLead } from '../../../hooks/useWidgetQueries';
import { MessageSquare, Ticket } from 'lucide-react';
import { Spinner } from '@easydev/ui';

export default function WidgetWelcomePage() {
  const router = useRouter();
  const config = useWidgetStore((state) => state.config);
  const customer = useWidgetStore((state) => state.customer);
  const sessionToken = useWidgetStore((state) => state.sessionToken);
  const pendingIdentity = useWidgetStore((state) => state.pendingIdentity);
  const identityVerified = useWidgetStore((state) => state.identityVerified);

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [consent, setConsent] = React.useState(false);

  const { data: conversation, isError } = useResumeWidgetConversation();
  const startConversationMutation = useStartWidgetConversation();
  const verifyIdentityMutation = useVerifyWidgetIdentity();
  const captureLeadMutation = useCaptureLead();

  // A disabled query (still waiting on the session bootstrap) reports
  // isLoading: false in TanStack Query v5, so check for "no answer yet"
  // directly instead - otherwise this would flash the welcome-back UI
  // for first-time visitors before the resume probe has even run.
  const isResolving = !conversation && !isError;

  // If the embedding tenant identified this visitor (signed server-side),
  // verify it once the session is ready, then skip the pre-chat form entirely.
  React.useEffect(() => {
    if (!sessionToken || !pendingIdentity || identityVerified || verifyIdentityMutation.isPending) return;
    verifyIdentityMutation.mutate(pendingIdentity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken, pendingIdentity, identityVerified]);

  React.useEffect(() => {
    if (identityVerified && isError && pendingIdentity?.email && !startConversationMutation.isPending) {
      startConversationMutation.mutate(
        { email: pendingIdentity.email, name: pendingIdentity.name },
        { onSuccess: () => router.push('/chat') },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identityVerified, isError, pendingIdentity]);

  const isAutoStarting = !!pendingIdentity?.email && (verifyIdentityMutation.isPending || (identityVerified && startConversationMutation.isPending));

  const handlePreChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      alert('Please check consent block to continue support.');
      return;
    }
    captureLeadMutation.mutate({ email, name: name || undefined });
    startConversationMutation.mutate({ email, name: name || undefined });
  };

  const handleStartChat = () => {
    router.push('/chat');
  };

  if (isResolving || isAutoStarting) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-50/50">
        <Spinner className="h-6 w-6 text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-5 space-y-6">
      {isError ? (
        <form onSubmit={handlePreChatSubmit} className="space-y-4 text-xs">
          <div className="text-center space-y-2">
            <h2 className="text-sm font-bold text-neutral-800">{config.welcomeMessage}</h2>
            <p className="text-neutral-500">Please share your email so our team can follow up with you.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="prechat-name" className="font-semibold text-neutral-600">Full Name (optional)</label>
            <input
              id="prechat-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alice Vance"
              className="border border-neutral-200 rounded p-2.5 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="prechat-email" className="font-semibold text-neutral-600">Email Address</label>
            <input
              id="prechat-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alice.vance@example.com"
              className="border border-neutral-200 rounded p-2.5 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-start gap-2.5">
            <input
              id="prechat-consent"
              type="checkbox"
              checked={consent}
              onChange={() => setConsent(!consent)}
              className="h-4 w-4 rounded border-neutral-300 text-primary-500 cursor-pointer"
            />
            <label htmlFor="prechat-consent" className="text-[10px] leading-normal text-neutral-500">
              I agree to the processing of personal data for support tracking.
            </label>
          </div>

          {startConversationMutation.isError && (
            <p className="text-[10px] text-danger-600 font-medium">
              Something went wrong starting the chat. Please try again.
            </p>
          )}

          <button
            type="submit"
            disabled={startConversationMutation.isPending}
            style={{ backgroundColor: config.primaryColor }}
            className="w-full text-white font-bold py-2.5 rounded-lg shadow-xs hover:opacity-90 transition flex items-center justify-center disabled:opacity-60"
          >
            <span>{startConversationMutation.isPending ? 'Starting chat...' : 'Start Session'}</span>
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-sm font-bold text-neutral-900">Welcome back{customer?.name ? `, ${customer.name}` : ''}!</h2>
            <p className="text-xs text-neutral-500">How can we assist you today?</p>
          </div>

          <div className="space-y-3.5">
            <button
              onClick={handleStartChat}
              className="w-full p-4 border border-neutral-200 hover:border-primary-300 rounded-lg flex items-center justify-between bg-white shadow-3xs transition text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-primary-50 text-primary-600 rounded-md flex items-center justify-center">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-neutral-800 block">Continue Support Chat</span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">Pick up where you left off</span>
                </div>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-neutral-400 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => router.push('/tickets')}
              className="w-full p-4 border border-neutral-200 hover:border-primary-300 rounded-lg flex items-center justify-between bg-white shadow-3xs transition text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-neutral-50 text-neutral-600 rounded-md flex items-center justify-center">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-neutral-800 block">File Support Ticket</span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">Submit detail inquiries to agents queue</span>
                </div>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-neutral-400 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}
