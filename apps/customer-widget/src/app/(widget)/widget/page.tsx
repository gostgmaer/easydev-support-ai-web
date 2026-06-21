'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useWidgetStore } from '../../../store/widgetStore';
import { useVerifyOtp, useRequestMagicLink } from '../../../hooks/useWidgetQueries';
import { MessageSquare, Ticket, ShoppingBag, Send, ShieldCheck, HelpCircle } from 'lucide-react';

export default function WidgetWelcomePage() {
  const router = useRouter();
  const config = useWidgetStore((state) => state.config);
  const session = useWidgetStore((state) => state.session);
  const setSession = useWidgetStore((state) => state.setSession);
  const initializeWidget = useWidgetStore((state) => state.initializeWidget);
  const setActiveConversationId = useWidgetStore((state) => state.setActiveConversationId);

  // Form states for Pre-Chat
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [otpMode, setOtpMode] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState('');
  const [consent, setConsent] = React.useState(false);

  const requestMagicMutation = useRequestMagicLink();
  const verifyOtpMutation = useVerifyOtp();

  // Order tracking search state
  const [orderQuery, setOrderQuery] = React.useState('');
  const [orderResult, setOrderResult] = React.useState<any>(null);

  // Initialize widget context (mock tenant resolution)
  React.useEffect(() => {
    initializeWidget('tenant-ecom-101');
  }, [initializeWidget]);

  const handlePreChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      alert('Please check consent block to continue support.');
      return;
    }

    if (otpMode) {
      // Verify OTP
      verifyOtpMutation.mutate(
        { email, code: otpCode },
        {
          onSuccess: () => {
            setOtpMode(false);
          },
        }
      );
    } else {
      // Trigger OTP Request / Magic link
      requestMagicMutation.mutate(email, {
        onSuccess: () => {
          setOtpMode(true);
        },
        onError: () => {
          // Fallback guest session activation
          setSession({ name, email, verified: true });
        },
      });
    }
  };

  const handleStartChat = () => {
    // mock active chat channel creation
    setActiveConversationId('conv-widget-999');
    router.push('/chat');
  };

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    // Simulate connectors order lookup sync
    setOrderResult({
      id: orderQuery.trim(),
      status: 'Out for Delivery',
      eta: '5:00 PM Today',
      total: 124.50,
    });
  };

  return (
    <div className="h-full overflow-y-auto p-5 space-y-6">
      {/* 1. GUEST PRE-CHAT / LOGIN MODE */}
      {!session.verified ? (
        <form onSubmit={handlePreChatSubmit} className="space-y-4 text-xs">
          <div className="text-center space-y-2">
            <h2 className="text-sm font-bold text-neutral-800">{config.welcomeMessage}</h2>
            <p className="text-neutral-500">Please verify email to begin support chat or view past order invoices.</p>
          </div>

          {!otpMode ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="prechat-name" className="font-semibold text-neutral-600">Full Name</label>
                <input
                  id="prechat-name"
                  type="text"
                  required
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
            </>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="prechat-otp" className="font-semibold text-neutral-600">One-Time Password (OTP)</label>
              <input
                id="prechat-otp"
                type="text"
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="border border-neutral-200 rounded p-2.5 bg-white text-neutral-800 text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          {/* Consent Checkbox */}
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

          <button
            type="submit"
            style={{ backgroundColor: config.primaryColor }}
            className="w-full text-white font-bold py-2.5 rounded-lg shadow-xs hover:opacity-90 transition flex items-center justify-center"
          >
            <span>{otpMode ? 'Verify Access' : 'Start Session'}</span>
          </button>
        </form>
      ) : (
        // 2. WELCOME / RECOMMENDED ACTIONS PAGE
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-sm font-bold text-neutral-900">Welcome back, {session.name || 'Client'}!</h2>
            <p className="text-xs text-neutral-500">How can we assist you today?</p>
          </div>

          {/* Quick Actions List */}
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
                  <span className="font-bold text-xs text-neutral-800 block">Start Live Support Chat</span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">Deflected replies synced with AI copilot</span>
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

          {/* Order Tracking widget section */}
          <div className="border border-neutral-200 rounded-lg p-4 bg-white shadow-3xs space-y-3">
            <h3 className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
              <ShoppingBag className="h-4 w-4 text-neutral-500" />
              <span>Track Shopify Order</span>
            </h3>

            <form onSubmit={handleTrackOrder} className="flex gap-2">
              <label htmlFor="order-lookup-input" className="sr-only">Order ID</label>
              <input
                id="order-lookup-input"
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Order number (e.g. ORD-1205)"
                className="flex-1 text-xs border border-neutral-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="bg-neutral-800 hover:bg-neutral-900 text-white px-3 py-1.5 rounded text-xs font-bold transition"
              >
                Track
              </button>
            </form>

            {/* Display Order Result */}
            {orderResult && (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-xs space-y-2 mt-2 leading-relaxed">
                <div className="flex justify-between font-bold text-neutral-800">
                  <span>Order: {orderResult.id}</span>
                  <span className="text-primary-600">{orderResult.status}</span>
                </div>
                <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                  <span>Estimated Arrival: {orderResult.eta}</span>
                  <span>Total: ${orderResult.total.toFixed(2)}</span>
                </div>
              </div>
            )}
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
