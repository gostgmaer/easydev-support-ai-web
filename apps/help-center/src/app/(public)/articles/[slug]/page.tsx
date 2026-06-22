import type { Metadata } from 'next';
import ArticleClientViewer from './ArticleClientViewer';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tenantId?: string }>;
}

/**
 * Server-side metadata generator for crawlable SEO.
 * Fetches dynamic article details before page render to inject OpenGraph and Twitter tags.
 */
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { tenantId } = await searchParams;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3333';

  if (tenantId) {
    try {
      const res = await fetch(`${apiBaseUrl}/v1/public/knowledge/documents/${slug}`, {
        headers: { 'x-tenant-id': tenantId },
        next: { revalidate: 60 }, // Cache response for 60 seconds (ISR)
      });

      if (res.ok) {
        const article = await res.json();
        const description = article.content?.substring(0, 150);
        return {
          title: `${article.title} | EasyDev Help Center`,
          description,
          openGraph: {
            title: article.title,
            description,
            type: 'article',
            publishedTime: article.updatedAt,
            authors: ['EasyDev Support'],
          },
          twitter: {
            card: 'summary_large_image',
            title: article.title,
            description,
          },
          alternates: {
            canonical: `/articles/${slug}`,
          },
        };
      }
    } catch (err) {
      // Fallback on request errors
    }
  }

  // Safe fallback metadata (no tenantId in the URL, or the fetch failed)
  return {
    title: 'Support Article | EasyDev Help Center',
    description: 'Browse helpful step-by-step guides and documentation from our customer support center.',
  };
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  return <ArticleClientViewer slug={resolvedParams.slug} />;
}
