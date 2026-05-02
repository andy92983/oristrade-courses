import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — OrisTrade",
  description: "OrisTrade Terms of Service. By using our platform you agree to these terms.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display font-black text-3xl md:text-4xl text-white mb-2">Terms of Service</h1>
        <p className="text-brand-muted text-sm mb-10">Last updated: April 2026</p>

        <div className="space-y-8 text-brand-muted text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-base mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using OrisTrade (oristrade.com), you agree to be bound by these Terms of Service.
              If you do not agree, do not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">2. Educational Purpose Only</h2>
            <p>
              All content, signals, analysis, and information provided by OrisTrade is for <strong className="text-white">educational
              and informational purposes only</strong>. Nothing on this platform constitutes financial advice,
              investment advice, or a solicitation to buy or sell any security or financial instrument.
              OrisTrade is not a registered investment advisor (RIA) or broker-dealer.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">3. Risk Disclosure</h2>
            <p>
              Trading and investing in financial markets involves substantial risk of loss and is not appropriate
              for all investors. You should only trade with money you can afford to lose. Past performance of
              any signal, strategy, or indicator is not indicative of future results. OrisTrade assumes no
              liability for any trading losses you incur.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">4. Membership and Billing</h2>
            <p>
              Paid memberships are billed monthly. You may cancel at any time from your account settings.
              Cancellations take effect at the end of the current billing period — no partial refunds are
              issued. OrisTrade reserves the right to modify pricing with 30 days' notice.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">5. Prohibited Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Redistribute, resell, or share access to member-only content</li>
              <li>Scrape, copy, or reproduce signals, analysis, or data without permission</li>
              <li>Use the platform for any unlawful purpose</li>
              <li>Attempt to reverse-engineer or interfere with the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">6. Intellectual Property</h2>
            <p>
              All content on OrisTrade — including but not limited to signals, indicators, educational
              material, brand assets, and proprietary algorithms — is the intellectual property of
              OrisTrade. Unauthorized use is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, OrisTrade and its operators shall not be liable for
              any direct, indirect, incidental, or consequential damages arising from your use of the
              platform, including trading losses.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">8. Changes to Terms</h2>
            <p>
              OrisTrade may update these terms at any time. Continued use of the platform following
              any changes constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">9. Contact</h2>
            <p>
              Questions about these terms? Contact us at{" "}
              <a href="mailto:hello@oristrade.com" className="text-brand-gold hover:underline">
                hello@oristrade.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-brand-border flex gap-6">
          <Link href="/privacy" className="text-brand-gold text-sm hover:underline">Privacy Policy</Link>
          <Link href="/risk" className="text-brand-gold text-sm hover:underline">Risk Disclosure</Link>
          <Link href="/contact" className="text-brand-gold text-sm hover:underline">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
