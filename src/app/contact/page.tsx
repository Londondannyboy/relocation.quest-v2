import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us | Relocation Quest',
  description: 'Get in touch with Relocation Quest. Questions about relocating abroad? Our AI advisor ATLAS can help, or reach out to our team directly.',
  openGraph: {
    title: 'Contact Us | Relocation Quest',
    description: 'Get in touch with Relocation Quest.',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-white">
      {/* Hero */}
      <div className="bg-stone-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto">
            Have questions about relocating abroad? We're here to help.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Talk to ATLAS */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">🎙️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Talk to ATLAS</h2>
            <p className="text-gray-600 mb-6">
              Get instant answers from our AI relocation advisor. ATLAS can help with visa questions,
              cost of living comparisons, and personalized destination recommendations.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors"
            >
              Start a conversation
            </Link>
          </div>

          {/* Email Contact */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Email Us</h2>
            <p className="text-gray-600 mb-6">
              For partnership inquiries, press requests, or questions that need a human touch,
              reach out to our team directly.
            </p>
            <a
              href="mailto:hello@relocation.quest"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
            >
              hello@relocation.quest
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'How accurate is the visa information?',
                a: 'We strive to keep our information up-to-date, but visa requirements change frequently. Always verify with official government sources before making decisions.',
              },
              {
                q: 'Can ATLAS help me apply for a visa?',
                a: 'ATLAS provides information and guidance about visa options, but we don\'t process visa applications. We recommend working with immigration lawyers for complex cases.',
              },
              {
                q: 'Is Relocation Quest free to use?',
                a: 'Yes! Our guides, destination information, and AI advisor are free to use. We may introduce premium features in the future.',
              },
              {
                q: 'How do you make money?',
                a: 'Currently, Relocation Quest is a showcase project demonstrating AI-powered relocation assistance. In the future, we may partner with relocation services, visa agencies, or offer premium features.',
              },
              {
                q: 'Can I contribute content?',
                a: 'We love hearing from expats! If you\'d like to share your relocation story or contribute expert content, reach out to us via email.',
              },
            ].map((faq, i) => (
              <details key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 group">
                <summary className="p-6 cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                  {faq.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-16 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow Us</h3>
          <div className="flex justify-center gap-4">
            <a
              href="https://twitter.com/relocationquest"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <span className="text-xl">𝕏</span>
            </a>
            <a
              href="https://linkedin.com/company/relocationquest"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <span className="text-xl">in</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
