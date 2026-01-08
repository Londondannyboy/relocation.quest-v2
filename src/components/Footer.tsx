'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="font-serif text-xl font-bold">
              Relocation Quest
            </Link>
            <p className="text-gray-400 text-sm mt-2">
              Your AI guide to moving abroad. Expert advice for visas, cost of living, and international relocation.
            </p>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="font-semibold mb-3">Destinations</h4>
            <nav className="flex flex-col gap-2 text-sm text-gray-400">
              <Link href="/destinations/portugal" className="hover:text-white transition-colors">Portugal</Link>
              <Link href="/destinations/spain" className="hover:text-white transition-colors">Spain</Link>
              <Link href="/destinations/cyprus" className="hover:text-white transition-colors">Cyprus</Link>
              <Link href="/destinations/dubai" className="hover:text-white transition-colors">Dubai</Link>
              <Link href="/destinations/canada" className="hover:text-white transition-colors">Canada</Link>
              <Link href="/destinations/australia" className="hover:text-white transition-colors">Australia</Link>
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-3">Resources</h4>
            <nav className="flex flex-col gap-2 text-sm text-gray-400">
              <Link href="/guides" className="hover:text-white transition-colors">Relocation Guides</Link>
              <Link href="/articles" className="hover:text-white transition-colors">All Articles</Link>
              <Link href="/destinations" className="hover:text-white transition-colors">Browse Destinations</Link>
              <Link href="/" className="hover:text-white transition-colors">Talk to ATLAS</Link>
            </nav>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <nav className="flex flex-col gap-2 text-sm text-gray-400">
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/profile" className="hover:text-white transition-colors">My Profile</Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            Powered by CopilotKit, Hume, and Neon
          </p>
          <p className="text-xs text-gray-500">
            {new Date().getFullYear()} Relocation Quest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
