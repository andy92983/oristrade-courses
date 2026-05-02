import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About OrisTrade — Our Mission & Vision",
  description:
    "OrisTrade combines 12 layers of market intelligence into clear trading signals. Learn about our mission, the founder's vision, and the path from education to hedge fund.",
};

const ROADMAP = [
  {
    phase: "Phase 1",
    title: "Foundation",
    period: "Month 1–2",
    items: [
      "Live homepage with real-time market data",
      "Signal dashboard with Layers 1–2",
      "Education hub with free content",
      "YouTube channel launch",
    ],
    status: "active",
  },
  {
    phase: "Phase 2",
    title: "Growth",
    period: "Month 3–4",
    items: [
      "Full options flow via Polygon.io",
      "Order flow & dark pool dashboard",
      "Member authentication & gated tiers",
      "Trade journal feature",
    ],
    status: "upcoming",
  },
  {
    phase: "Phase 3",
    title: "Premium",
    period: "Month 5–6",
    items: [
      "All 12 signal layers live",
      "AI-powered news scanner",
      "Backtesting engine",
      "Mobile-responsive PWA",
    ],
    status: "upcoming",
  },
  {
    phase: "Phase 4",
    title: "Hedge Fund",
    period: "Year 2+",
    items: [
      "Oris Capital fund launch",
      "Institutional data feeds",
      "Private investor portal",
      "Regulatory compliance (RIA)",
    ],
    status: "upcoming",
  },
];

const VALUES = [
  {
    icon: "🎯",
    title: "Precision First",
    desc: "Every signal is backed by 12 layers of data. No guesswork, no hype — just clear, weighted confluence scores with plain-English reasoning.",
  },
  {
    icon: "📚",
    title: "Education Over Selling",
    desc: "We teach you why signals fire, not just what to do. OrisTrade is an education platform first — the goal is to make you a better trader.",
  },
  {
    icon: "🌍",
    title: "All Markets, One Platform",
    desc: "Forex, futures, options, stocks, and crypto — all covered. Most platforms specialize in one market. We give you the full picture.",
  },
  {
    icon: "🔓",
    title: "Transparent Methodology",
    desc: "Every signal shows exactly which layers contributed and why. No black boxes. You see the data, the weight, and the reasoning.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="layer-badge mb-4 inline-block">ABOUT</span>
          <h1 className="font-display font-black text-4xl md:text-6xl text-white leading-tight mb-6">
            The <span className="text-gradient-gold">Future of Trading</span> Intelligence
          </h1>
          <p className="text-brand-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            OrisTrade is a multi-layer market intelligence platform built for traders who want
            the full picture — not just one piece of the puzzle. We combine order flow, technicals,
            macro data, sentiment, and AI into one clear signal.
          </p>
        </div>
      </section>

      {/* Brand Meaning */}
      <section className="py-16 px-4 bg-brand-card/30 border-y border-brand-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-10">Why "OrisTrade"?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <div className="text-brand-gold text-2xl mb-3">🗣️</div>
              <h3 className="text-white font-semibold mb-2">Latin: Voice & Expression</h3>
              <p className="text-brand-muted text-sm leading-relaxed">
                "Oris" in Latin means voice or expression — the articulation of trading knowledge into
                clear, actionable intelligence.
              </p>
            </div>
            <div className="card">
              <div className="text-brand-gold text-2xl mb-3">⏱️</div>
              <h3 className="text-white font-semibold mb-2">Swiss Precision & Timing</h3>
              <p className="text-brand-muted text-sm leading-relaxed">
                The Swiss watchmaker Oris represents precision and timing — because in trading,
                timing is everything.
              </p>
            </div>
            <div className="card">
              <div className="text-brand-gold text-2xl mb-3">🌅</div>
              <h3 className="text-white font-semibold mb-2">Sanskrit: Origin & Rising</h3>
              <p className="text-brand-muted text-sm leading-relaxed">
                Sanskrit roots link to "origin" and "rising" — representing the beginning of
                mastery and the rise of a new kind of trader.
              </p>
            </div>
            <div className="card">
              <div className="text-brand-gold text-2xl mb-3">✨</div>
              <h3 className="text-white font-semibold mb-2">Modern & Premium</h3>
              <p className="text-brand-muted text-sm leading-relaxed">
                Short, global, and premium-sounding — similar to Axios, Aura, and Orex.
                Built for a worldwide audience of serious traders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Values */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="layer-badge mb-3 inline-block">OUR VALUES</span>
            <h2 className="section-title">What Drives OrisTrade</h2>
            <p className="section-subtitle">
              We believe every trader deserves institutional-grade intelligence, explained in plain English.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="card hover:border-brand-gold/30 transition-all duration-300">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="font-display font-bold text-white text-lg mb-2">{v.title}</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 px-4 bg-brand-card/30 border-y border-brand-border">
        <div className="max-w-4xl mx-auto text-center">
          <span className="layer-badge mb-4 inline-block">THE VISION</span>
          <h2 className="section-title">From Education to Hedge Fund</h2>
          <p className="text-brand-muted text-lg leading-relaxed max-w-3xl mx-auto mb-6">
            OrisTrade is more than a signal platform. The long-term vision is to build one of the most
            data-driven, transparent hedge funds in the market — starting with education, growing through
            community, and scaling into institutional capital management.
          </p>
          <p className="text-brand-muted text-lg leading-relaxed max-w-3xl mx-auto">
            Every member who joins today is part of that journey from day one. As the platform
            evolves, so does the intelligence powering your trades.
          </p>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="layer-badge mb-3 inline-block">ROADMAP</span>
            <h2 className="section-title">Where We're Going</h2>
            <p className="section-subtitle">
              A clear path from launch to hedge fund — built in public, one phase at a time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ROADMAP.map((phase) => (
              <div
                key={phase.phase}
                className={`card relative ${
                  phase.status === "active" ? "border-brand-gold glow-gold" : ""
                }`}
              >
                {phase.status === "active" && (
                  <span className="absolute -top-3 left-4 bg-gold-gradient text-brand-bg text-xs font-black px-3 py-1 rounded-full">
                    CURRENT
                  </span>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-brand-gold font-display font-bold text-lg">{phase.phase}</span>
                  <span className="text-brand-muted text-sm">— {phase.period}</span>
                </div>
                <h3 className="font-display font-bold text-white text-xl mb-3">{phase.title}</h3>
                <ul className="space-y-2">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-brand-muted">
                      <span className="text-brand-gold mt-0.5">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center border-t border-brand-border">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display font-black text-3xl md:text-4xl text-white mb-6">
            Ready to Join the <span className="text-gradient-gold">Journey?</span>
          </h2>
          <p className="text-brand-muted text-lg mb-8">
            Start with free market data and education. Upgrade when you're ready for institutional-grade signals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing" className="btn-gold text-base py-4 px-8">
              See Pricing →
            </Link>
            <Link href="/education" className="btn-outline text-base py-4 px-8">
              Explore Education
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
