import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import "@copilotkit/react-ui/styles.css"
import "@neondatabase/neon-js/ui/css"
import { authClient } from '@/lib/auth/client'
import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react/ui'
import { CopilotWrapper } from '@/components/CopilotWrapper'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const siteUrl = "https://relocation-quest-v2.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Relocation Quest | Your AI Guide to Moving Abroad",
    template: "%s | Relocation Quest",
  },
  description: "Discover your perfect destination with ATLAS, your AI relocation advisor. Visa guides, cost of living data, and personalized recommendations for 17+ countries.",
  keywords: ["relocation", "moving abroad", "digital nomad visa", "expat guide", "cost of living", "work abroad", "visa requirements", "Portugal", "Spain", "Dubai"],
  authors: [{ name: "Relocation Quest" }],
  creator: "Relocation Quest",
  publisher: "Relocation Quest",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Relocation Quest",
    title: "Relocation Quest | Your AI Guide to Moving Abroad",
    description: "Discover your perfect destination with ATLAS, your AI relocation advisor. Visa guides, cost of living data, and personalized recommendations.",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Relocation Quest - Your AI Guide to Moving Abroad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Relocation Quest | Your AI Guide to Moving Abroad",
    description: "Discover your perfect destination with ATLAS, your AI relocation advisor.",
    images: [`${siteUrl}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
}

// Organization JSON-LD schema
function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Relocation Quest",
    url: siteUrl,
    logo: `${siteUrl}/favicon.ico`,
    description: "AI-powered relocation advisor helping people move abroad with visa guides, cost of living data, and personalized recommendations.",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: `${siteUrl}/contact`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// WebSite JSON-LD schema for search
function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Relocation Quest",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/articles?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-stone-50 text-gray-900`} suppressHydrationWarning>
        <NeonAuthUIProvider
          authClient={authClient}
          redirectTo="/"
          social={{ providers: ['google'] }}
        >
          <CopilotWrapper>
            <Header />
            <main className="flex-1 pb-16">
              {children}
            </main>
            <Footer />
          </CopilotWrapper>
        </NeonAuthUIProvider>
      </body>
    </html>
  )
}
