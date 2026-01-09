"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

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

export function ArticleClient({ article }: { article: Article }) {
  const router = useRouter();

  const handleAskATLAS = () => {
    router.push(`/?topic=${encodeURIComponent(article.title)}`);
  };

  // Render content - handle HTML, Markdown, or plain text
  const renderContent = () => {
    const content = article.content || article.content_text || "";

    // Check if content contains HTML tags (full HTML)
    if (content.includes("<h") || content.includes("<p>") || content.includes("<div")) {
      return (
        <div
          className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 prose-li:text-gray-700"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    // Check if content contains Markdown (## headers, - lists, etc.)
    if (content.includes("##") || content.includes("- ") || content.includes("**")) {
      return (
        <div className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-ul:my-4 prose-ol:my-4">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      );
    }

    // Plain text - split by paragraphs
    return (
      <div className="prose prose-stone prose-lg max-w-none">
        {content.split("\n\n").map((paragraph, i) => (
          <p key={i} className="text-gray-700 leading-relaxed mb-4">{paragraph}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-stone-50 min-h-screen">
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb with JSON-LD */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700">
            Home
          </Link>
          <span>/</span>
          <Link href="/articles" className="hover:text-gray-700">
            Articles
          </Link>
          <span>/</span>
          <span className="text-gray-700 truncate max-w-[200px]">
            {article.title}
          </span>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed">
              {article.excerpt}
            </p>
          )}
          {/* Meta info */}
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
            {article.country && (
              <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded">
                {article.country}
              </span>
            )}
            {article.article_mode && (
              <span className="bg-stone-100 text-stone-700 px-2 py-1 rounded capitalize">
                {article.article_mode}
              </span>
            )}
            {article.published_at && (
              <time dateTime={article.published_at}>
                {new Date(article.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
          </div>
        </header>

        {/* Hero Image */}
        {article.hero_image_url && (
          <figure className="mb-8">
            <img
              src={article.hero_image_url}
              alt={article.title}
              className="w-full rounded-lg shadow-md"
              loading="eager"
            />
          </figure>
        )}

        {/* Article Content */}
        <article className="mb-12">{renderContent()}</article>

        {/* Ask ATLAS CTA */}
        <div className="bg-gradient-to-r from-stone-100 to-amber-50 rounded-xl p-6 border border-stone-200 mb-8">
          <h2 className="font-serif font-bold text-gray-900 text-xl mb-2">
            Want to learn more?
          </h2>
          <p className="text-gray-600 mb-4">
            Ask ATLAS for more details about {article.title} and related topics.
          </p>
          <button
            onClick={handleAskATLAS}
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <span>🎙️</span>
            <span>Ask ATLAS about this</span>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-200">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to articles</span>
          </Link>

          <Link
            href="/guides"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Browse all guides →
          </Link>
        </div>
      </main>
    </div>
  );
}
