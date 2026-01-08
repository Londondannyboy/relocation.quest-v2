import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Relocation Quest',
  description: 'Privacy policy for Relocation Quest. Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: January 2026</p>

        <div className="prose prose-stone max-w-none">
          <h2>1. Information We Collect</h2>
          <p>
            When you use Relocation Quest, we may collect information you provide directly,
            such as your name and email when you create an account, and information about
            your relocation preferences when you interact with ATLAS, our AI advisor.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide personalized relocation recommendations</li>
            <li>Remember your preferences across sessions</li>
            <li>Improve our AI advisor's responses</li>
            <li>Send you relevant updates (with your consent)</li>
          </ul>

          <h2>3. Data Storage</h2>
          <p>
            Your data is stored securely using Neon PostgreSQL with encryption at rest.
            Conversation history with ATLAS may be stored using Zep for personalization purposes.
          </p>

          <h2>4. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>Hume AI</strong> - For voice interaction processing</li>
            <li><strong>CopilotKit</strong> - For AI chat functionality</li>
            <li><strong>Neon</strong> - For database and authentication</li>
            <li><strong>Vercel</strong> - For hosting</li>
          </ul>

          <h2>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of personalization</li>
            <li>Export your data</li>
          </ul>

          <h2>6. Contact</h2>
          <p>
            For privacy-related inquiries, contact us at{' '}
            <a href="mailto:privacy@relocation.quest">privacy@relocation.quest</a>
          </p>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-amber-600 hover:text-amber-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
