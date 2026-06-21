'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FileText, Import, Folder, Plus, Search, Trash2, Globe, FileUp } from 'lucide-react';
import { useKnowledgeDocuments, useImportKnowledge } from '@/hooks/useAdminQueries';

export default function KnowledgePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: documents = [], isLoading } = useKnowledgeDocuments();
  const importMutation = useImportKnowledge();

  const [activeTab, setActiveTab] = React.useState<'documents' | 'sources' | 'categories'>('documents');
  const [search, setSearch] = React.useState('');
  
  // Local Form state for website importing
  const [webUrl, setWebUrl] = React.useState('');
  const [docTitle, setDocTitle] = React.useState('');

  React.useEffect(() => {
    if (pathname.includes('/sources')) {
      setActiveTab('sources');
    } else if (pathname.includes('/categories')) {
      setActiveTab('categories');
    } else {
      setActiveTab('documents');
    }
  }, [pathname]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'documents') {
      router.push('/knowledge');
    } else {
      router.push(`/knowledge/${tab}`);
    }
  };

  const handleImportWeb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !webUrl.trim()) return;

    importMutation.mutate(
      {
        title: docTitle.trim(),
        sourceType: 'website',
        webUrl: webUrl.trim(),
      },
      {
        onSuccess: () => {
          setDocTitle('');
          setWebUrl('');
          handleTabChange('documents');
        },
      }
    );
  };

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" role="region" aria-label="Knowledge Base Manager">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Knowledge Base Management</h1>
          <p className="text-xs text-neutral-500">Manage documents, import website scraping scopes, parse FAQs, and check help article categories.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-md text-xs font-bold self-start md:self-center gap-1">
          {(['documents', 'sources', 'categories'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 rounded-md capitalize transition ${
                activeTab === tab
                  ? 'bg-white text-primary-600 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Viewport */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs min-h-[300px]">
        {/* 1. DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative w-72">
                <label htmlFor="kb-doc-search" className="sr-only">Search documents</label>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  id="kb-doc-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full text-xs rounded border border-neutral-200 pl-9 pr-3 py-2 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                onClick={() => handleTabChange('sources')}
                className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs px-3.5 py-2 rounded-md transition"
              >
                <Plus className="h-4 w-4" />
                <span>Import Source</span>
              </button>
            </div>

            {isLoading ? (
              <p className="text-center text-xs text-neutral-400 animate-pulse py-8">Loading document library...</p>
            ) : filteredDocs.length > 0 ? (
              <div className="overflow-x-auto border border-neutral-100 rounded-lg text-xs">
                <table className="w-full text-left divide-y divide-neutral-100">
                  <thead className="bg-neutral-50 font-bold text-neutral-500">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Source Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Version</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id}>
                        <td className="p-3 font-semibold text-neutral-800">{doc.title}</td>
                        <td className="p-3 capitalize">{doc.sourceType}</td>
                        <td className="p-3">
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.25 rounded ${
                            doc.status === 'published' ? 'text-success bg-success/15' : 'text-neutral-500 bg-neutral-100'
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="p-3">v{doc.version}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => alert(`Deleting document: ${doc.title}`)} className="text-neutral-400 hover:text-danger p-1">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-neutral-400">
                <FileText className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
                <p>No documents imported yet. Link website crawlers or upload PDFs to begin.</p>
              </div>
            )}
          </div>
        )}

        {/* 2. SOURCES TAB */}
        {activeTab === 'sources' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Web Scraping Import */}
            <div className="border border-neutral-200 rounded-lg p-5 bg-neutral-50/50 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5 border-b border-neutral-200 pb-2">
                <Globe className="h-4 w-4 text-primary-500" />
                <span>Web URL Scraping Import</span>
              </h2>
              
              <form onSubmit={handleImportWeb} className="space-y-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="import-web-title" className="font-semibold text-neutral-600">Document Reference Name</label>
                  <input
                    id="import-web-title"
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. Shipping Policies and Delivery Times"
                    className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="import-web-url" className="font-semibold text-neutral-600">Scraping Root URL</label>
                  <input
                    id="import-web-url"
                    type="url"
                    required
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    placeholder="https://example.com/help/shipping"
                    className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={importMutation.isPending}
                  className="w-full bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 rounded transition disabled:opacity-50"
                >
                  {importMutation.isPending ? 'Scraping Url...' : 'Trigger Web Scraping'}
                </button>
              </form>
            </div>

            {/* Document PDF upload */}
            <div className="border border-neutral-200 rounded-lg p-5 bg-neutral-50/50 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5 border-b border-neutral-200 pb-2">
                  <FileUp className="h-4 w-4 text-success" />
                  <span>PDF Document Upload</span>
                </h2>
                
                <div className="border-2 border-dashed border-neutral-200 rounded-lg p-8 text-center text-xs text-neutral-500 bg-white hover:bg-neutral-50 transition cursor-pointer">
                  <FileText className="h-10 w-10 text-neutral-300 mx-auto mb-2 animate-bounce" />
                  <span>Drag and drop shipping reports, FAQs or policy PDF files here</span>
                </div>
              </div>

              <button
                onClick={() => alert('PDF parser wizard initiated')}
                className="w-full border border-neutral-200 hover:bg-neutral-50 text-neutral-800 font-bold py-2 rounded transition"
              >
                Upload File
              </button>
            </div>
          </div>
        )}

        {/* 3. CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Structured Category Folders</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50 text-xs">
                <span className="font-bold text-neutral-800 block mb-1">📦 Order Logistics</span>
                <span className="text-neutral-500">Shipping, delivery, tracking and Shopify returns.</span>
              </div>
              <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50 text-xs">
                <span className="font-bold text-neutral-800 block mb-1">💳 Account & Billing</span>
                <span className="text-neutral-500">Invoicing, trial periods, subscription upgrades.</span>
              </div>
              <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50 text-xs">
                <span className="font-bold text-neutral-800 block mb-1">⚙️ General Settings</span>
                <span className="text-neutral-500">Password resets, API keys config, multi-tenant.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
