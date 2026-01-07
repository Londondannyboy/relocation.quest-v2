'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <Link href="/" className="font-serif text-xl font-bold">
              Relocation Quest
            </Link>
            <p className="text-gray-400 text-sm mt-1">
              Your AI guide to moving abroad
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Talk to ATLAS</Link>
            <Link href="/profile" className="hover:text-white transition-colors">Profile</Link>
          </nav>
        </div>
        <div className="border-t border-gray-800 mt-6 pt-6 text-center text-xs text-gray-500">
          <p>
            Powered by CopilotKit, Hume, and Neon
          </p>
        </div>
      </div>
    </footer>
  )
}
