'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FileText, Search, Trash2, Folder, Plus, Globe } from 'lucide-react';
import { toAppError } from '@easydev/utils';
import {
  useKnowledgeDocuments,
  useDeleteKnowledgeDocument,
  useKnowledgeCategories,
  useKnowledgeSources,
  useCreateKnowledgeSource,
  useCreateKnowledgeDocument,
} from '@/hooks/useAdminQueries';
import type { KnowledgeDocument } from '@/store/adminStore';

const STATUS_TONE: Record<KnowledgeDocument['status'], string> = {
  ACTIVE: 'text-success bg-success/15',
  PROCESSING: 'text-info bg-info/15',
  INDEXING: 'text-info bg-info/15',
  DRAFT: 'text-neutral-500 bg-neutral-100',
  ARCHIVED: 'text-neutral-400 bg-neutral-100',
  FAILED: 'text-danger bg-danger/15',
};

const SOURCE_TYPES = [
  'WEBSITE',
  'SITEMAP',
  'URL',
  'PDF',
  'DOCX',
  'TXT',
  'CSV',
  'MARKDOWN',
  'FAQ',
  'CONFLUENCE',
  'NOTION',
  'GOOGLE_DOC',
  'MANUAL',
] as const;

const DOCUMENT_TYPES = ['PDF', 'DOCX', 'TXT', 'CSV', 'MARKDOWN', 'FAQ', 'HTML', 'WEBPAGE', 'MANUAL'] as const;

function AddSourceForm({ onCreated }: { onCreated: () => void }) {
  const createMutation = useCreateKnowledgeSource();
  const [name, setName] = React.useState('');
  const [sourceType, setSourceType] = React.useState<string>(SOURCE_TYPES[0]);
  const [uri, setUri] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createMutation.mutate(
      {
        name: name.trim(),
        sourceType,
        uri: uri.trim() || undefined,
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          setName('');
          setUri('');
          setDescription('');
          onCreated();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs max-w-2xl">
      {createMutation.isError && (
        <p className="text-danger-600 bg-danger/10 border border-danger/20 rounded p-2">
          {toAppError(createMutation.error).message}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="source-name" className="font-bold text-neutral-600">Name</label>
          <input
            id="source-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Help Center Website"
            className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="source-type" className="font-bold text-neutral-600">Source Type</label>
          <select
            id="source-type"
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {SOURCE_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label htmlFor="source-uri" className="font-bold text-neutral-600">URI (optional)</label>
          <input
            id="source-uri"
            type="url"
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            placeholder="https://help.example.com"
            className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label htmlFor="source-description" className="font-bold text-neutral-600">Description (optional)</label>
          <input
            id="source-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What this source is used for"
            className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={createMutation.isPending}
        className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-3.5 py-2 rounded-md disabled:opacity-60"
      >
        {createMutation.isPending ? 'Creating...' : 'Add Source'}
      </button>
    </form>
  );
}

function AddDocumentForm({
  sources,
  categories,
  onCreated,
}: {
  sources: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  onCreated: () => void;
}) {
  const createMutation = useCreateKnowledgeDocument();
  const [sourceId, setSourceId] = React.useState(sources[0]?.id ?? '');
  const [categoryId, setCategoryId] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [documentType, setDocumentType] = React.useState<string>(DOCUMENT_TYPES[0]);
  const [language, setLanguage] = React.useState('en');
  const [fileUrl, setFileUrl] = React.useState('');
  const [tagsInput, setTagsInput] = React.useState('');

  React.useEffect(() => {
    if (!sourceId && sources[0]) setSourceId(sources[0].id);
  }, [sources, sourceId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !title.trim() || !slug.trim() || !language.trim()) return;
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    createMutation.mutate(
      {
        sourceId,
        categoryId: categoryId || undefined,
        title: title.trim(),
        slug: slug.trim(),
        documentType,
        language: language.trim(),
        fileUrl: fileUrl.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      },
      {
        onSuccess: () => {
          setTitle('');
          setSlug('');
          setFileUrl('');
          setTagsInput('');
          onCreated();
        },
      },
    );
  };

  if (sources.length === 0) {
    return (
      <p className="text-xs text-neutral-400 italic py-2">
        Add a knowledge source first - documents are always registered against one.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs max-w-2xl border border-neutral-200 rounded-lg p-4 bg-neutral-50/50">
      {createMutation.isError && (
        <p className="text-danger-600 bg-danger/10 border border-danger/20 rounded p-2">
          {toAppError(createMutation.error).message}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="doc-title" className="font-bold text-neutral-600">Title</label>
          <input
            id="doc-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="How to reset your password"
            className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="doc-slug" className="font-bold text-neutral-600">Slug</label>
          <input
            id="doc-slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="how-to-reset-your-password"
            className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="doc-source" className="font-bold text-neutral-600">Source</label>
          <select
            id="doc-source"
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {sources.map((src) => (
              <option key={src.id} value={src.id}>{src.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="doc-category" className="font-bold text-neutral-600">Category (optional)</label>
          <select
            id="doc-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">None</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="doc-type" className="font-bold text-neutral-600">Document Type</label>
          <select
            id="doc-type"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="doc-language" className="font-bold text-neutral-600">Language</label>
          <input
            id="doc-language"
            required
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="en"
            className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label htmlFor="doc-file-url" className="font-bold text-neutral-600">File URL (optional)</label>
          <input
            id="doc-file-url"
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://cdn.example.com/docs/password-reset.pdf"
            className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label htmlFor="doc-tags" className="font-bold text-neutral-600">Tags (comma-separated, optional)</label>
          <input
            id="doc-tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="account, security"
            className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={createMutation.isPending}
        className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-3.5 py-2 rounded-md disabled:opacity-60"
      >
        {createMutation.isPending ? 'Creating...' : 'Add Document'}
      </button>
      <p className="text-neutral-400">
        Documents reference a hosted file by URL - there is no binary upload endpoint in this backend yet.
      </p>
    </form>
  );
}

export default function KnowledgePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: documents = [], isLoading } = useKnowledgeDocuments();
  const deleteMutation = useDeleteKnowledgeDocument();
  const { data: categories = [], isLoading: isCategoriesLoading } = useKnowledgeCategories();
  const { data: sources = [], isLoading: isSourcesLoading } = useKnowledgeSources();

  const [activeTab, setActiveTab] = React.useState<'documents' | 'sources' | 'categories'>('documents');
  const [search, setSearch] = React.useState('');
  const [isAddingSource, setIsAddingSource] = React.useState(false);
  const [isAddingDocument, setIsAddingDocument] = React.useState(false);

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
            <div className="flex items-center justify-between gap-3">
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
                onClick={() => setIsAddingDocument((cur) => !cur)}
                className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs px-3.5 py-2 rounded-md transition"
              >
                <Plus className="h-4 w-4" />
                <span>{isAddingDocument ? 'Cancel' : 'Add Document'}</span>
              </button>
            </div>

            {isAddingDocument && (
              <AddDocumentForm
                sources={sources}
                categories={categories}
                onCreated={() => setIsAddingDocument(false)}
              />
            )}

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

        {/* 2. SOURCES TAB */}
        {activeTab === 'sources' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Knowledge Sources</h2>
              <button
                onClick={() => setIsAddingSource((cur) => !cur)}
                className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs px-3.5 py-2 rounded-md transition"
              >
                <Plus className="h-4 w-4" />
                <span>{isAddingSource ? 'Cancel' : 'Add Source'}</span>
              </button>
            </div>

            {isAddingSource && <AddSourceForm onCreated={() => setIsAddingSource(false)} />}

            {isSourcesLoading ? (
              <p className="text-center text-xs text-neutral-400 animate-pulse py-8">Loading sources...</p>
            ) : sources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sources.map((src) => (
                  <div key={src.id} className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50 text-xs flex items-start gap-2">
                    <Globe className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-neutral-800 block mb-0.5">{src.name}</span>
                      <span className="text-neutral-500 block">{src.sourceType}{src.uri ? ` • ${src.uri}` : ''}</span>
                      {src.description && <span className="text-neutral-400 block mt-1">{src.description}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-neutral-400">
                <Globe className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
                <p>No knowledge sources registered yet.</p>
              </div>
            )}
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
