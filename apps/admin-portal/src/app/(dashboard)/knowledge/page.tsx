'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FileText, Search, Trash2, Folder } from 'lucide-react';
import { useKnowledgeDocuments, useDeleteKnowledgeDocument, useKnowledgeCategories } from '@/hooks/useAdminQueries';
import type { KnowledgeDocument } from '@/store/adminStore';

const STATUS_TONE: Record<KnowledgeDocument['status'], string> = {
  ACTIVE: 'text-success bg-success/15',
  PROCESSING: 'text-info bg-info/15',
  INDEXING: 'text-info bg-info/15',
  DRAFT: 'text-neutral-500 bg-neutral-100',
  ARCHIVED: 'text-neutral-400 bg-neutral-100',
  FAILED: 'text-danger bg-danger/15',
};

export default function KnowledgePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: documents = [], isLoading } = useKnowledgeDocuments();
  const deleteMutation = useDeleteKnowledgeDocument();
  const { data: categories = [], isLoading: isCategoriesLoading } = useKnowledgeCategories();

  const [activeTab, setActiveTab] = React.useState<'documents' | 'sources' | 'categories'>('documents');
  const [search, setSearch] = React.useState('');

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

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" role="region" aria-label="Knowledge Base Manager">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Knowledge Base Management</h1>
          <p className="text-xs text-neutral-500">Manage indexed documents and category structure.</p>
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

            {isLoading ? (
              <p className="text-center text-xs text-neutral-400 animate-pulse py-8">Loading document library...</p>
            ) : filteredDocs.length > 0 ? (
              <div className="overflow-x-auto border border-neutral-100 rounded-lg text-xs">
                <table className="w-full text-left divide-y divide-neutral-100">
                  <thead className="bg-neutral-50 font-bold text-neutral-500">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Version</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id}>
                        <td className="p-3 font-semibold text-neutral-800">{doc.title}</td>
                        <td className="p-3 capitalize">{doc.documentType.toLowerCase()}</td>
                        <td className="p-3">
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.25 rounded ${STATUS_TONE[doc.status]}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="p-3">v{doc.version}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Delete document "${doc.title}"?`)) {
                                deleteMutation.mutate({ id: doc.id });
                              }
                            }}
                            className="text-neutral-400 hover:text-danger p-1"
                            aria-label={`Delete ${doc.title}`}
                          >
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
                <p>No documents indexed yet.</p>
              </div>
            )}
          </div>
        )}

        {/* 2. SOURCES TAB - creating a document requires a pre-existing knowledge
            source (sourceId); source management isn't wired into this UI yet,
            so this is an honest stub rather than a form that can't actually work. */}
        {activeTab === 'sources' && (
          <div className="text-center py-12 text-xs text-neutral-400">
            <p>Knowledge source management isn&apos;t available in this UI yet.</p>
            <p className="mt-1">Documents are imported against a registered source via the API directly for now.</p>
          </div>
        )}

        {/* 3. CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Categories</h2>

            {isCategoriesLoading ? (
              <p className="text-center text-xs text-neutral-400 animate-pulse py-8">Loading categories...</p>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50 text-xs flex items-start gap-2">
                    <Folder className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-neutral-800 block mb-1">{cat.name}</span>
                      {cat.description && <span className="text-neutral-500">{cat.description}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic py-6 text-center">No categories defined yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
