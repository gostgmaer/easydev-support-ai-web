'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageSquare, Mail, Phone, ArrowLeft, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { Button, Badge } from '@easydev/ui';

export default function ContactSupportPage() {
  const router = useRouter();

  const handleOpenWidget = () => {
    // Post message to open the chat widget launcher iframe
    if (typeof window !== 'undefined') {
      const iframe = document.getElementById('easydev-chat-widget-frame') as HTMLIFrameElement;
      if (iframe) {
        // Toggle widget inside iframe
        iframe.contentWindow?.postMessage({ event: 'widget:toggle', open: true }, '*');
        // Notify host script (embed.js) to expand the iframe container
        window.postMessage({ event: 'widget:toggle', open: true }, '*');
      } else {
        alert('Active live chat widget is offline or loading.');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Title bar */}
      <div className="border-b border-neutral-105 pb-3">
        <h1 className="text-xl font-extrabold text-neutral-900">Contact Support</h1>
        <p className="text-neutral-500 mt-1">Select the best channel to resolve your inquiry with our operations team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Live Chat option */}
        <div className="p-5 border border-neutral-200 bg-white rounded-xl shadow-3xs flex flex-col justify-between text-center space-y-4">
          <div className="space-y-3">
            <div className="h-10 w-10 bg-success-50 text-success-600 rounded-full flex items-center justify-center mx-auto">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-neutral-900 text-xs">Live Chat Assistant</h3>
              <p className="text-neutral-400 text-[10px] leading-relaxed">Chat instantly with our AI Copilot or escalate to human agent.</p>
            </div>
          </div>
          <Button
            onClick={handleOpenWidget}
            className="w-full bg-success-600 hover:bg-success-700 text-white font-bold text-[10px] py-1.5"
          >
            Open Live Chat
          </Button>
        </div>

        {/* Email case option */}
        <div className="p-5 border border-neutral-200 bg-white rounded-xl shadow-3xs flex flex-col justify-between text-center space-y-4">
          <div className="space-y-3">
            <div className="h-10 w-10 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto">
              <Mail className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-neutral-900 text-xs">Submit Email Case</h3>
              <p className="text-neutral-400 text-[10px] leading-relaxed">File a support ticket and track resolving logs from inbox.</p>
            </div>
          </div>
          <Link href="/submit-ticket">
            <Button
              className="w-full bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-[10px] py-1.5"
            >
              Submit Ticket
            </Button>
          </Link>
        </div>

        {/* Phone Callback option */}
        <div className="p-5 border border-neutral-200 bg-white rounded-xl shadow-3xs flex flex-col justify-between text-center space-y-4">
          <div className="space-y-3">
            <div className="h-10 w-10 bg-warning-50 text-warning-600 rounded-full flex items-center justify-center mx-auto">
              <Phone className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-neutral-900 text-xs">Phone Callback</h3>
              <p className="text-neutral-400 text-[10px] leading-relaxed">Request a direct callback from an agent (Enterprise only).</p>
            </div>
          </div>
          <Button
            disabled
            className="w-full bg-neutral-100 border border-neutral-200 text-neutral-400 cursor-not-allowed font-bold text-[10px] py-1.5"
          >
            Callback Locked
          </Button>
        </div>
      </div>

      {/* Support SLA notice */}
      <div className="p-4 border border-neutral-200 bg-white rounded-xl shadow-3xs flex gap-3 items-start leading-relaxed text-neutral-500">
        <ShieldCheck className="h-5 w-5 text-neutral-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-neutral-850 block text-[11px]">Support SLA Guarantee</span>
          <p className="text-[10px] font-normal leading-normal">
            Standard email tickets are answered within 24 business hours. Enterprise account cases are flagged automatically for prioritized routing.
          </p>
        </div>
      </div>
    </div>
  );
}
