'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { authClient } from '@/lib/auth/client'

// Globe icon SVG component
function GlobeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418"
      />
    </svg>
  )
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = authClient.useSession()

  return (
    <header className="sticky top-0 z-50 bg-stone-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo with globe icon */}
          <Link href="/" className="flex items-center gap-2 group">
            <GlobeIcon className="w-6 h-6 text-amber-500 group-hover:text-amber-400 transition-colors" />
            <span className="text-xl font-serif font-bold">Relocation Quest</span>
          </Link>

          {/* Right side - Auth buttons ALWAYS visible */}
          <div className="flex items-center gap-2">
            {/* Nav links - show key links on all sizes */}
            <nav className="flex items-center gap-1 mr-2 md:mr-4">
              {session?.user && (
                <Link
                  href="/dashboard"
                  className={`px-2 md:px-3 py-2 text-xs md:text-sm transition-colors ${
                    pathname === '/dashboard'
                      ? 'text-white bg-white/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  My Journey
                </Link>
              )}
              <Link
                href="/articles"
                className={`hidden sm:block px-2 md:px-3 py-2 text-xs md:text-sm transition-colors ${
                  pathname === '/articles'
                    ? 'text-white bg-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Guides
              </Link>
              <Link
                href="/destinations"
                className={`hidden sm:block px-2 md:px-3 py-2 text-xs md:text-sm transition-colors ${
                  pathname?.startsWith('/destinations')
                    ? 'text-white bg-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Destinations
              </Link>
            </nav>

            {/* Auth - ALWAYS visible on all screen sizes */}
            {session?.user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await authClient.signOut()
                    window.location.href = '/'
                  }}
                  className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
                <Link href="/profile">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full hover:ring-2 hover:ring-white/50 transition-all"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-sm font-medium">
                      {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                    </div>
                  )}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/sign-in"
                  className="px-4 py-2 text-sm font-medium bg-white text-black rounded hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden ml-2 p-2 text-white hover:bg-white/10 rounded"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation dropdown */}
        {menuOpen && (
          <nav className="md:hidden py-3 border-t border-white/20">
            <Link
              href="/"
              className={`block px-4 py-2 ${pathname === '/' ? 'text-white bg-white/10' : 'text-gray-300'}`}
              onClick={() => setMenuOpen(false)}
            >
              Talk to ATLAS
            </Link>
            {session?.user && (
              <Link
                href="/dashboard"
                className={`block px-4 py-2 ${pathname === '/dashboard' ? 'text-white bg-white/10' : 'text-gray-300'}`}
                onClick={() => setMenuOpen(false)}
              >
                My Journey
              </Link>
            )}
            <Link
              href="/articles"
              className={`block px-4 py-2 ${pathname === '/articles' ? 'text-white bg-white/10' : 'text-gray-300'}`}
              onClick={() => setMenuOpen(false)}
            >
              Browse Guides
            </Link>
            <Link
              href="/destinations"
              className={`block px-4 py-2 ${pathname?.startsWith('/destinations') ? 'text-white bg-white/10' : 'text-gray-300'}`}
              onClick={() => setMenuOpen(false)}
            >
              Destinations
            </Link>
            <Link
              href="/profile"
              className={`block px-4 py-2 ${pathname === '/profile' ? 'text-white bg-white/10' : 'text-gray-300'}`}
              onClick={() => setMenuOpen(false)}
            >
              My Profile
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
