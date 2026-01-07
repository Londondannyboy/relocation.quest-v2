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

export const metadata: Metadata = {
  title: "Relocation Quest | Your AI Guide to Moving Abroad",
  description: "Discover your perfect destination with ATLAS, your AI relocation advisor. Visa guides, cost of living data, and personalized recommendations.",
  keywords: ["relocation", "moving abroad", "digital nomad visa", "expat guide", "cost of living", "work abroad"],
  authors: [{ name: "Relocation Quest" }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
