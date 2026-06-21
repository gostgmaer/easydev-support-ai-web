'use client';

import * as React from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Input, Badge } from '@easydev/ui';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export default function FAQDatabasePage() {
  const [searchVal, setSearchVal] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('ALL');
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const faqItems: FAQItem[] = [
    {
      id: 'faq-1',
      category: 'Billing',
      question: 'How do I retrieve my invoices?',
      answer: 'To retrieve invoices, sign in to your Account page, navigate to the Billing tab, and select Invoice History. You can download each invoice as a PDF with itemized tax details.',
    },
    {
      id: 'faq-2',
      category: 'Billing',
      question: 'When will I be billed for third-party Shopify apps?',
      answer: 'Third-party Shopify applications are typically billed on your 30-day Shopify subscription invoice unless they utilize an independent external connector portal which requires a separate credit card.',
    },
    {
      id: 'faq-3',
      category: 'Shipping',
      question: 'Where can I find my tracking number?',
      answer: 'Your tracking number is sent automatically to your verified email address as soon as the package leaves our warehouse. You can also view it in the Order tracking portal or by using the Shopify order widget.',
    },
    {
      id: 'faq-4',
      category: 'Refunds',
      question: 'How long does standard refund processing take?',
      answer: 'Once approved, refunds take between 5 to 10 business days to post to your bank account or card balance, depending on standard card network processing times.',
    },
    {
      id: 'faq-5',
      category: 'Refunds',
      question: 'Do you charge restocking or inspection fees?',
      answer: 'Standard returns do not incur restocking fees. However, items returned damaged or missing original packaging are subject to a 15% custom inspection deduction from the total refund amount.',
    },
    {
      id: 'faq-6',
      category: 'Cancellation',
      question: 'Can I cancel an order after it has shipped?',
      answer: 'Orders cannot be cancelled once they enter our shipping pipeline or have been picked by carrier services. Once received, you can initiate a standard return label to ship it back for a full refund.',
    },
  ];

  const categories = ['ALL', 'Billing', 'Shipping', 'Refunds', 'Cancellation'];

  const filteredFAQs = React.useMemo(() => {
    return faqItems.filter((faq) => {
      const matchSearch =
        !searchVal ||
        faq.question.toLowerCase().includes(searchVal.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchVal.toLowerCase());

      const matchCategory = selectedCategory === 'ALL' || faq.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [searchVal, selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Title section */}
      <div className="border-b border-neutral-100 pb-3">
        <h1 className="text-xl font-extrabold text-neutral-900">Frequently Asked Questions</h1>
        <p className="text-neutral-500 mt-1">Quick answers to standard questions about billing, shipping, and order cancellations.</p>
      </div>

      {/* Filter and Search controls */}
      <section className="bg-white p-5 border border-neutral-200 rounded-xl shadow-3xs space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <Input
            value={searchVal}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchVal(e.target.value)}
            placeholder="Filter FAQ questions..."
            className="pl-9 text-xs h-9 bg-neutral-50/30"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-[10px]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full font-bold border transition ${
                selectedCategory === cat
                  ? 'bg-neutral-800 text-white border-neutral-800'
                  : 'bg-neutral-50 text-neutral-500 border-neutral-250 hover:bg-neutral-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* FAQ Accordion List */}
      <section className="space-y-3">
        {filteredFAQs.length === 0 ? (
          <div className="p-8 text-center border border-neutral-250 rounded-xl bg-white space-y-2">
            <HelpCircle className="h-8 w-8 text-neutral-300 mx-auto" />
            <p className="font-bold text-neutral-800">No matching FAQs found</p>
            <p className="text-neutral-400 text-[10px]">Try clearing search filters or entering different query keywords.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredFAQs.map((faq) => {
              const isOpen = expandedId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="border border-neutral-200 rounded-xl bg-white shadow-3xs overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full px-4 py-3.5 flex justify-between items-center text-left hover:bg-neutral-50/30 transition focus:outline-none"
                  >
                    <div className="flex items-center gap-3 pr-2">
                      <Badge tone="neutral" className="text-[8px] uppercase tracking-wider font-bold shrink-0">
                        {faq.category}
                      </Badge>
                      <h4 className="font-bold text-neutral-800 text-xs leading-snug">{faq.question}</h4>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-neutral-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" />
                    )}
                  </button>

                  {/* Expandable description body */}
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1.5 border-t border-neutral-100/60 text-neutral-600 leading-relaxed text-[11px] font-normal animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
