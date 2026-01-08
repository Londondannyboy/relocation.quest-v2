import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Relocation Quest',
  description: 'Terms of service for Relocation Quest. Please read these terms carefully before using our service.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: January 2026</p>

        <div className="prose prose-stone max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Relocation Quest, you accept and agree to be bound by
            these Terms of Service. If you do not agree, please do not use our service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Relocation Quest provides AI-powered relocation guidance through ATLAS, our
            virtual advisor. We offer information about visa requirements, cost of living,
            and destination guides. Our service is for informational purposes only.
          </p>

          <h2>3. Disclaimer</h2>
          <p>
            <strong>Important:</strong> The information provided by Relocation Quest and ATLAS
            is for general informational purposes only. Visa requirements, immigration laws,
            and regulations change frequently. Always verify information with official
            government sources and consult qualified immigration professionals before making
            relocation decisions.
          </p>

          <h2>4. User Accounts</h2>
          <p>
            You may create an account to save your preferences and conversation history.
            You are responsible for maintaining the security of your account and for all
            activities under your account.
          </p>

          <h2>5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to circumvent security measures</li>
            <li>Interfere with the service's operation</li>
            <li>Scrape or harvest data without permission</li>
          </ul>

          <h2>6. Intellectual Property</h2>
          <p>
            All content on Relocation Quest, including text, graphics, and AI-generated
            responses, is protected by copyright. You may use the information for personal,
            non-commercial purposes only.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            Relocation Quest is provided "as is" without warranties of any kind. We are not
            liable for any decisions made based on information from our service, including
            visa applications, relocation decisions, or financial matters.
          </p>

          <h2>8. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the service
            constitutes acceptance of any changes.
          </p>

          <h2>9. Contact</h2>
          <p>
            For questions about these terms, contact us at{' '}
            <a href="mailto:legal@relocation.quest">legal@relocation.quest</a>
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
