import type { Metadata } from 'next';
import ArticleClientViewer from './ArticleClientViewer';

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Server-side metadata generator for crawlable SEO.
 * Fetches dynamic article details before page render to inject OpenGraph and Twitter tags.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3333/api';

  try {
    const res = await fetch(`${apiBaseUrl}/help/articles/${slug}`, {
      next: { revalidate: 60 }, // Cache response for 60 seconds (ISR)
    });

    if (res.ok) {
      const article = await res.json();
      return {
        title: `${article.title} | EasyDev Help Center`,
        description: article.summary || article.content?.substring(0, 150),
        openGraph: {
          title: article.title,
          description: article.summary || article.content?.substring(0, 150),
          type: 'article',
          publishedTime: article.updatedAt,
          authors: [article.author?.name || 'EasyDev Support'],
        },
        twitter: {
          card: 'summary_large_image',
          title: article.title,
          description: article.summary || article.content?.substring(0, 150),
        },
        alternates: {
          canonical: `/articles/${slug}`,
        },
      };
    }
  } catch (err) {
    // Fallback on request errors
  }

  // Safe fallback metadata
  return {
    title: 'Support Article | EasyDev Help Center',
    description: 'Browse helpful step-by-step guides and documentation from our customer support center.',
  };
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  return <ArticleClientViewer slug={resolvedParams.slug} />;
}
