import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Education Hub — OrisTrade",
  description:
    "Learn to trade Forex, Futures, Options, and Crypto with OrisTrade's free education hub. Courses, guides, and video content for all skill levels.",
};

const COURSES = [
  {
    category: "Beginner",
    color: "brand-green",
    items: [
      {
        title: "Trading Foundations",
        desc: "Market types, order types, position sizing, risk management basics, and how to read a chart.",
        lessons: 12,
        duration: "2.5 hours",
        free: true,
      },
      {
        title: "Candlestick Patterns 101",
        desc: "Master the top 20 candlestick patterns every trader must know — with real chart examples.",
        lessons: 8,
        duration: "1.5 hours",
        free: true,
      },
      {
        title: "Introduction to Forex",
        desc: "Currency pairs, pips, lots, sessions, and the fundamentals of the $7.5T/day forex market.",
        lessons: 10,
        duration: "2 hours",
        free: true,
      },
    ],
  },
  {
    category: "Intermediate",
    color: "brand-gold",
    items: [
      {
        title: "Technical Analysis Mastery",
        desc: "Multi-timeframe analysis, VWAP, EMA strategies, RSI divergence, Bollinger Bands, and volume profiles.",
        lessons: 18,
        duration: "4 hours",
        free: false,
      },
      {
        title: "Options Selling for Income",
        desc: "Sell premium the smart way. Covered calls, cash-secured puts, iron condors, and IV rank strategies.",
        lessons: 15,
        duration: "3.5 hours",
        free: false,
      },
      {
        title: "Futures Trading Blueprint",
        desc: "E-mini S&P, NASDAQ futures, gold, oil — order flow, COT data, and session strategies.",
        lessons: 14,
        duration: "3 hours",
        free: false,
      },
    ],
  },
  {
    category: "Advanced",
    color: "brand-red",
    items: [
      {
        title: "Order Flow & Dark Pools",
        desc: "Read the real market. Options sweeps, dark pool prints, block trades, and institutional footprints.",
        lessons: 16,
        duration: "4 hours",
        free: false,
      },
      {
        title: "Scalping Mastery",
        desc: "Fast execution, tight stops, and high-probability setups. Scalp forex, futures, and crypto like a pro.",
        lessons: 12,
        duration: "3 hours",
        free: false,
      },
      {
        title: "Building a Trading System",
        desc: "Combine all 12 signal layers into a systematic edge. Backtesting, journaling, and performance tracking.",
        lessons: 10,
        duration: "2.5 hours",
        free: false,
      },
    ],
  },
];

const TOPICS = [
  { icon: "📊", label: "Technical Analysis" },
  { icon: "💹", label: "Forex Trading" },
  { icon: "📉", label: "Futures & Indices" },
  { icon: "🎯", label: "Options Selling" },
  { icon: "⚡", label: "Scalping" },
  { icon: "₿", label: "Crypto Markets" },
  { icon: "🧠", label: "Trading Psychology" },
  { icon: "📋", label: "Risk Management" },
  { icon: "🔍", label: "Order Flow" },
  { icon: "🌐", label: "Macro Economics" },
  { icon: "🤖", label: "Algorithmic Trading" },
  { icon: "📈", label: "Long-Term Investing" },
];

export default function EducationPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="layer-badge mb-4 inline-block">EDUCATION</span>
          <h1 className="font-display font-black text-4xl md:text-6xl text-white leading-tight mb-6">
            Learn to Trade <span className="text-gradient-gold">the Right Way</span>
          </h1>
          <p className="text-brand-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            OrisTrade doesn't just give you signals — we teach you why they work. Free and premium courses
            covering every market and every skill level.
          </p>
        </div>
      </section>

      {/* Topics Grid */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="section-title">What You'll Learn</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {TOPICS.map((topic) => (
              <div
                key={topic.label}
                className="card text-center py-4 px-2 hover:border-brand-gold/30 transition-all duration-300 cursor-default"
              >
                <div className="text-2xl mb-2">{topic.icon}</div>
                <div className="text-white text-xs font-medium">{topic.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Library */}
      <section className="py-20 px-4 bg-brand-card/30 border-y border-brand-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="layer-badge mb-3 inline-block">COURSE LIBRARY</span>
            <h2 className="section-title">Structured Learning Paths</h2>
            <p className="section-subtitle">
              From your first candlestick to reading dark pool prints — courses designed to take you
              from beginner to advanced, step by step.
            </p>
          </div>

          {COURSES.map((section) => (
            <div key={section.category} className="mb-12 last:mb-0">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-3 h-3 rounded-full bg-${section.color}`} />
                <h3 className="font-display font-bold text-white text-xl">{section.category}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {section.items.map((course) => (
                  <div
                    key={course.title}
                    className="card hover:border-brand-gold/30 transition-all duration-300 flex flex-col"
                  >
                    {course.free && (
                      <span className="inline-block self-start bg-brand-green/10 text-brand-green text-xs font-bold px-2 py-0.5 rounded-full border border-brand-green/20 mb-3">
                        FREE
                      </span>
                    )}
                    {!course.free && (
                      <span className="inline-block self-start bg-brand-gold/10 text-brand-gold text-xs font-bold px-2 py-0.5 rounded-full border border-brand-gold/20 mb-3">
                        MEMBERS
                      </span>
                    )}
                    <h4 className="font-display font-bold text-white text-lg mb-2">{course.title}</h4>
                    <p className="text-brand-muted text-sm leading-relaxed flex-1 mb-4">{course.desc}</p>
                    <div className="flex items-center gap-4 text-xs text-brand-muted border-t border-brand-border pt-3">
                      <span>{course.lessons} lessons</span>
                      <span className="text-brand-border">|</span>
                      <span>{course.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* YouTube Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="layer-badge mb-4 inline-block">YOUTUBE</span>
          <h2 className="section-title">Free Content on YouTube</h2>
          <p className="section-subtitle mb-8">
            Weekly videos covering scalping setups, options strategies, market analysis, and trading psychology.
            Subscribe to @OrisTrade to never miss an episode.
          </p>

          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">🎬</div>
            <h3 className="font-display font-bold text-white text-xl mb-3">@OrisTrade on YouTube</h3>
            <p className="text-brand-muted text-sm mb-6 max-w-md mx-auto">
              Scalping tutorials, options selling guides, forex fundamentals, trade reviews, and OrisTrade signal breakdowns.
            </p>
            <a
              href="https://youtube.com/@OrisTrade"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              Subscribe to @OrisTrade
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center border-t border-brand-border">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display font-black text-3xl md:text-4xl text-white mb-6">
            Start Learning <span className="text-gradient-gold">Today</span>
          </h2>
          <p className="text-brand-muted text-lg mb-8">
            Free courses to get you started. Upgrade for advanced content, order flow training, and live signal access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing" className="btn-gold text-base py-4 px-8">
              View All Plans →
            </Link>
            <Link href="/blog" className="btn-outline text-base py-4 px-8">
              Read the Blog
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
