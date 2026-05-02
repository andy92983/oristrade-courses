import Link from "next/link";
import type { Metadata } from "next";

// ─── Stripe Payment Links ─────────────────────────────────────────────────────
// SETUP: Create these in your Stripe dashboard (test mode first):
//   1. Go to stripe.com/dashboard → Products → Add product
//   2. Create a recurring price for each tier
//   3. Click "Payment Link" → copy the URL → paste below
// TEST CARDS: Use 4242 4242 4242 4242, any future date, any CVC
const STRIPE_LINKS = {
  starter: "https://buy.stripe.com/test_REPLACE_WITH_STARTER_LINK",
  pro:     "https://buy.stripe.com/test_REPLACE_WITH_PRO_LINK",
  elite:   "https://buy.stripe.com/test_REPLACE_WITH_ELITE_LINK",
  vip:     "https://buy.stripe.com/test_REPLACE_WITH_VIP_LINK",
} as const;

export const metadata: Metadata = {
  title: "Pricing — OrisTrade",
  description:
    "From free market data to institutional-grade hedge fund signals. Choose the OrisTrade plan that fits your trading style.",
};

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    desc: "Get started with live market data and educational content.",
    features: [
      { text: "Live TradingView charts & ticker tape", included: true },
      { text: "Market overview (Forex, Crypto, Futures)", included: true },
      { text: "Blog & analysis articles", included: true },
      { text: "YouTube video content", included: true },
      { text: "Sample signal previews (blurred)", included: true },
      { text: "Economic calendar", included: true },
      { text: "Live signal access", included: false },
      { text: "Order flow feed", included: false },
      { text: "Options analytics", included: false },
    ],
    cta: "Get Started Free",
    href: "/signals",
    highlight: false,
  },
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    desc: "Essential signals and education for new traders.",
    features: [
      { text: "Everything in Free", included: true },
      { text: "Layer 1–2 signal access", included: true },
      { text: "Basic signal dashboard", included: true },
      { text: "Education course library", included: true },
      { text: "Email support", included: true },
      { text: "Weekly market newsletter", included: true },
      { text: "Full order flow feed", included: false },
      { text: "Options analytics", included: false },
      { text: "1-on-1 access", included: false },
    ],
    cta: "Start Starter",
    href: STRIPE_LINKS.starter,
    external: true,
    highlight: false,
  },
  {
    name: "Pro",
    price: "$99",
    period: "/month",
    desc: "Full dashboard access for serious traders.",
    features: [
      { text: "Everything in Starter", included: true },
      { text: "Layers 1–6 full signal access", included: true },
      { text: "Live order flow feed", included: true },
      { text: "Dark pool & sweep alerts", included: true },
      { text: "Options analytics (IVR, GEX)", included: true },
      { text: "Intermarket correlation dashboard", included: true },
      { text: "Priority support", included: true },
      { text: "1-on-1 access", included: false },
      { text: "Institutional signals", included: false },
    ],
    cta: "Go Pro",
    href: STRIPE_LINKS.pro,
    external: true,
    highlight: true,
  },
  {
    name: "Elite",
    price: "$199",
    period: "/month",
    desc: "All 12 layers. The complete OrisTrade experience.",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "All 12 signal layers", included: true },
      { text: "AI news scanner", included: true },
      { text: "Trade journal", included: true },
      { text: "Backtesting engine", included: true },
      { text: "Community forum access", included: true },
      { text: "1-on-1 monthly call", included: true },
      { text: "Crypto signal dashboard", included: true },
      { text: "Institutional signals", included: false },
    ],
    cta: "Go Elite",
    href: STRIPE_LINKS.elite,
    external: true,
    highlight: false,
  },
  {
    name: "Hedge Fund VIP",
    price: "$499",
    period: "/month",
    desc: "Institutional-grade intelligence for professional traders.",
    features: [
      { text: "Everything in Elite", included: true },
      { text: "Institutional-grade signals", included: true },
      { text: "Private VIP community", included: true },
      { text: "Fund research & reports", included: true },
      { text: "Quarterly strategy calls", included: true },
      { text: "White-glove onboarding", included: true },
      { text: "Early access to new features", included: true },
      { text: "Direct founder access", included: true },
      { text: "Priority signal alerts (SMS/push)", included: true },
    ],
    cta: "Join VIP",
    href: STRIPE_LINKS.vip,
    external: true,
    highlight: false,
  },
];

const FAQ = [
  {
    q: "Can I try OrisTrade before paying?",
    a: "Yes. The Free tier gives you live market data, charts, blog content, and sample signals — no credit card required.",
  },
  {
    q: "What's the difference between the tiers?",
    a: "Each tier unlocks more signal layers. Free gives you charts and content. Starter adds Layers 1–2. Pro adds Layers 1–6 with order flow. Elite unlocks all 12 layers. VIP adds institutional-grade signals and direct access.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. All plans are month-to-month with no long-term contracts. Cancel anytime from your account settings.",
  },
  {
    q: "Are these signals financial advice?",
    a: "No. OrisTrade is an educational platform providing market intelligence tools. All signals are for educational purposes only and do not constitute financial advice. Always do your own research.",
  },
  {
    q: "What markets do you cover?",
    a: "Forex (major/minor pairs), US Futures (S&P, NASDAQ, Gold, Oil), US Stock Options, US Equities, and Crypto (BTC, ETH, top alts).",
  },
  {
    q: "How do the 12 signal layers work?",
    a: "Each layer analyzes a different data source — from order flow and technicals to macro data and AI pattern recognition. They're weighted and combined into a single 0–100 confluence score with clear entry, stop loss, and target levels.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="layer-badge mb-4 inline-block">PRICING</span>
          <h1 className="font-display font-black text-4xl md:text-6xl text-white leading-tight mb-6">
            Start Free. <span className="text-gradient-gold">Scale as You Grow.</span>
          </h1>
          <p className="text-brand-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            From free market data to institutional-grade hedge fund signals.
            Every tier includes plain-English explanations with every signal.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Desktop: horizontal cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`card flex flex-col ${
                  tier.highlight ? "border-brand-gold glow-gold ring-1 ring-brand-gold/30 relative" : ""
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gold-gradient text-brand-bg text-xs font-black px-3 py-1 rounded-full whitespace-nowrap">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-4 pt-2">
                  <div className="font-display font-bold text-white text-lg">{tier.name}</div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-display font-black text-3xl text-gradient-gold">{tier.price}</span>
                    <span className="text-brand-muted text-sm">{tier.period}</span>
                  </div>
                  <p className="text-brand-muted text-xs mt-2 leading-relaxed">{tier.desc}</p>
                </div>

                <ul className="flex-1 space-y-2 mb-6">
                  {tier.features.map((f) => (
                    <li
                      key={f.text}
                      className={`flex items-start gap-2 text-sm ${
                        f.included ? "text-brand-muted" : "text-brand-muted/40 line-through"
                      }`}
                    >
                      <span className={`mt-0.5 flex-shrink-0 ${f.included ? "text-brand-green" : "text-brand-muted/30"}`}>
                        {f.included ? "✓" : "—"}
                      </span>
                      {f.text}
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className={`${tier.highlight ? "btn-gold" : "btn-outline"} text-sm text-center block`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Layer breakdown */}
      <section className="py-16 px-4 bg-brand-card/30 border-y border-brand-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="section-title mb-6">What's in Each Layer?</h2>
          <div className="overflow-x-auto rounded-xl border border-brand-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border bg-brand-card">
                  <th className="text-left px-4 py-3 text-brand-muted font-medium">Layer</th>
                  <th className="text-center px-3 py-3 text-brand-muted font-medium text-xs">Free</th>
                  <th className="text-center px-3 py-3 text-brand-muted font-medium text-xs">Starter</th>
                  <th className="text-center px-3 py-3 text-brand-gold font-medium text-xs">Pro</th>
                  <th className="text-center px-3 py-3 text-brand-muted font-medium text-xs">Elite</th>
                  <th className="text-center px-3 py-3 text-brand-muted font-medium text-xs">VIP</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "1. Order Flow", tiers: [false, true, true, true, true] },
                  { name: "2. Technical Analysis", tiers: [false, true, true, true, true] },
                  { name: "3. Macro Data", tiers: [false, false, true, true, true] },
                  { name: "4. Sentiment", tiers: [false, false, true, true, true] },
                  { name: "5. Congressional/Insider", tiers: [false, false, true, true, true] },
                  { name: "6. Intermarket", tiers: [false, false, true, true, true] },
                  { name: "7. Microstructure", tiers: [false, false, false, true, true] },
                  { name: "8. AI Patterns", tiers: [false, false, false, true, true] },
                  { name: "9. Options Analytics", tiers: [false, false, false, true, true] },
                  { name: "10. AI News", tiers: [false, false, false, true, true] },
                  { name: "11. Crypto Signals", tiers: [false, false, false, true, true] },
                  { name: "12. Proprietary", tiers: [false, false, false, true, true] },
                ].map((layer) => (
                  <tr key={layer.name} className="border-b border-brand-border/50 hover:bg-brand-card/50">
                    <td className="px-4 py-2.5 text-white font-medium text-xs">{layer.name}</td>
                    {layer.tiers.map((included, i) => (
                      <td key={i} className="px-3 py-2.5 text-center">
                        {included ? (
                          <span className="text-brand-green text-sm">✓</span>
                        ) : (
                          <span className="text-brand-muted/30 text-sm">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="layer-badge mb-3 inline-block">FAQ</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="card">
                <h3 className="font-semibold text-white text-sm mb-2">{item.q}</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center border-t border-brand-border">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display font-black text-3xl md:text-4xl text-white mb-6">
            Start Trading <span className="text-gradient-gold">Smarter Today</span>
          </h2>
          <p className="text-brand-muted text-lg mb-8">
            No credit card required for the Free tier. Upgrade anytime as your trading evolves.
          </p>
          <Link href="/signals" className="btn-gold text-base py-4 px-8">
            View Live Signals →
          </Link>
        </div>
      </section>
    </>
  );
}
