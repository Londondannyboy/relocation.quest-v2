import { Metadata } from "next";
import { notFound } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { ArticleClient } from "./ArticleClient";

interface Article {
  id: string;
  title: string;
  content: string;
  content_text: string;
  slug: string;
  excerpt: string | null;
  hero_image_url: string | null;
  country: string | null;
  article_mode: string | null;
  published_at: string | null;
}

async function getArticle(slug: string): Promise<Article | null> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;

  try {
    const sql = neon(databaseUrl);
    const articles = await sql`
      SELECT
        id::text,
        title,
        content,
        content_text,
        slug,
        excerpt,
        hero_image_url,
        country,
        article_mode,
        published_at
      FROM articles
      WHERE slug = ${slug}
      LIMIT 1
    `;
    return articles[0] as Article || null;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: "Article Not Found | Relocation Quest",
    };
  }

  const description = article.excerpt || article.content_text?.slice(0, 160) || `Read about ${article.title}`;
  const url = `https://relocation-quest-v2.vercel.app/article/${slug}`;

  return {
    title: `${article.title} | Relocation Quest`,
    description,
    keywords: [
      "relocation",
      "moving abroad",
      article.country || "international",
      article.article_mode || "guide",
    ].filter(Boolean),
    authors: [{ name: "Relocation Quest" }],
    openGraph: {
      title: article.title,
      description,
      url,
      siteName: "Relocation Quest",
      type: "article",
      publishedTime: article.published_at || undefined,
      images: article.hero_image_url
        ? [
            {
              url: article.hero_image_url,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: article.hero_image_url ? [article.hero_image_url] : [],
    },
    alternates: {
      canonical: url,
    },
  };
}

// JSON-LD structured data for articles
function ArticleJsonLd({ article }: { article: Article }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || article.content_text?.slice(0, 160),
    image: article.hero_image_url || undefined,
    datePublished: article.published_at || undefined,
    author: {
      "@type": "Organization",
      name: "Relocation Quest",
      url: "https://relocation-quest-v2.vercel.app",
    },
    publisher: {
      "@type": "Organization",
      name: "Relocation Quest",
      logo: {
        "@type": "ImageObject",
        url: "https://relocation-quest-v2.vercel.app/favicon.ico",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://relocation-quest-v2.vercel.app/article/${article.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ArticlePage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <ArticleJsonLd article={article} />
      <ArticleClient article={article} />
    </>
  );
}
