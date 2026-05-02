import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Risk Disclosure — OrisTrade",
  description: "Important risk disclosure for trading financial markets with OrisTrade.",
};

export default function RiskPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-brand-red/10 border border-brand-red/30 rounded-lg px-4 py-2 mb-6">
          <span className="text-brand-red text-sm font-semibold">⚠️ Important Risk Warning</span>
        </div>

        <h1 className="font-display font-black text-3xl md:text-4xl text-white mb-2">Risk Disclosure</h1>
        <p className="text-brand-muted text-sm mb-10">Last updated: April 2026</p>

        <div className="space-y-8 text-brand-muted text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-base mb-3">Trading Involves Significant Risk</h2>
            <p>
              Trading stocks, options, futures, forex, and cryptocurrencies involves a high level of risk
              and may not be suitable for all investors. The high degree of leverage can work against you
              as well as for you. Before deciding to trade financial instruments you should carefully
              consider your investment objectives, level of experience, and risk appetite.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">No Financial Advice</h2>
            <p>
              OrisTrade is an <strong className="text-white">educational and market intelligence platform</strong>.
              Nothing on this platform — including but not limited to signals, indicators, analysis,
              commentary, charts, or any other content — constitutes financial advice, investment advice,
              trading advice, or any recommendation to buy, sell, or hold any asset. You are solely
              responsible for your own trading decisions.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">Past Performance</h2>
            <p>
              Past performance of any signal, strategy, or indicator shown on OrisTrade is <strong className="text-white">not
              indicative of future results</strong>. Markets are dynamic and conditions change constantly.
              Historical win rates, profit factors, or return figures should not be relied upon as
              a guarantee or expectation of future performance.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">Leverage and Derivatives Risk</h2>
            <p>
              Futures, options, and forex are leveraged products. This means you can lose more than
              your initial deposit. The use of leverage significantly amplifies both profits and losses.
              Make sure you understand how leverage works before trading these instruments.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">Only Trade What You Can Afford to Lose</h2>
            <p>
              Never trade with money you cannot afford to lose. Do not trade with funds needed for
              essential expenses, retirement, or other critical financial obligations. Speculative
              trading should only be done with discretionary capital.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">Technology and Execution Risk</h2>
            <p>
              Signal data, market feeds, and platform features depend on third-party services.
              Delays, outages, or inaccuracies in data can occur. OrisTrade makes no warranty
              about the real-time accuracy or completeness of any data displayed on the platform.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">Regulatory Notice</h2>
            <p>
              OrisTrade is not a registered investment advisor, broker-dealer, or financial institution.
              The platform is not regulated by the SEC, FINRA, CFTC, FCA, or any other financial
              regulatory body. Content is provided for educational purposes only.
            </p>
          </section>

          <section className="bg-brand-red/5 border border-brand-red/20 rounded-xl p-5">
            <p className="text-brand-red font-medium">
              By using OrisTrade, you acknowledge that you have read and understood this risk disclosure,
              and that you accept full responsibility for any trading decisions you make.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-brand-border flex gap-6">
          <Link href="/terms" className="text-brand-gold text-sm hover:underline">Terms of Service</Link>
          <Link href="/privacy" className="text-brand-gold text-sm hover:underline">Privacy Policy</Link>
          <Link href="/contact" className="text-brand-gold text-sm hover:underline">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
