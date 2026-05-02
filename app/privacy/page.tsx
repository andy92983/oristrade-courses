import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — OrisTrade",
  description: "OrisTrade Privacy Policy. Learn how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display font-black text-3xl md:text-4xl text-white mb-2">Privacy Policy</h1>
        <p className="text-brand-muted text-sm mb-10">Last updated: April 2026</p>

        <div className="space-y-8 text-brand-muted text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-base mb-3">1. Information We Collect</h2>
            <p>When you create an account or use OrisTrade, we may collect:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Email address and full name (at signup)</li>
              <li>Payment information (processed securely by Stripe — we never store card data)</li>
              <li>Usage data — pages visited, features used, session duration</li>
              <li>Trade journal entries you voluntarily add to the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">2. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Provide and improve the OrisTrade platform</li>
              <li>Process your membership subscription</li>
              <li>Send transactional emails (account verification, password reset)</li>
              <li>Send our weekly newsletter if you subscribe (opt-out anytime)</li>
              <li>Ensure platform security and prevent abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">3. Data Storage</h2>
            <p>
              Your account data is stored securely in Supabase (PostgreSQL), hosted on AWS infrastructure
              with encryption at rest and in transit. Trade journal data is private to your account and
              protected by row-level security policies.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">4. Third-Party Services</h2>
            <p>OrisTrade uses the following third-party services:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li><strong className="text-white">Supabase</strong> — authentication and database</li>
              <li><strong className="text-white">Stripe</strong> — payment processing</li>
              <li><strong className="text-white">Cloudflare</strong> — CDN, hosting, and security</li>
              <li><strong className="text-white">TradingView</strong> — embedded chart widgets</li>
            </ul>
            <p className="mt-3">Each third party operates under their own privacy policy.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">5. Cookies</h2>
            <p>
              OrisTrade uses minimal cookies — primarily for authentication session management via
              Supabase. We do not use third-party advertising cookies or tracking pixels.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">6. Data Sharing</h2>
            <p>
              We do not sell, rent, or share your personal information with third parties for marketing
              purposes. We may share data with service providers (listed above) strictly to operate
              the platform.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Access the personal data we hold about you</li>
              <li>Request deletion of your account and associated data</li>
              <li>Update your personal information via your account settings</li>
              <li>Opt out of marketing emails at any time</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at{" "}
              <a href="mailto:hello@oristrade.com" className="text-brand-gold hover:underline">
                hello@oristrade.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We'll notify you of significant
              changes via email or a notice on the platform.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-brand-border flex gap-6">
          <Link href="/terms" className="text-brand-gold text-sm hover:underline">Terms of Service</Link>
          <Link href="/risk" className="text-brand-gold text-sm hover:underline">Risk Disclosure</Link>
          <Link href="/contact" className="text-brand-gold text-sm hover:underline">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
