import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog & Analysis — OrisTrade",
  description:
    "Expert trading analysis, market breakdowns, and educational articles covering Forex, Futures, Options, and Crypto. SEO-optimized content by OrisTrade.",
};

const FEATURED_POST = {
  title: "Why 90% of Traders Lose Money — and How to Be the 10%",
  excerpt:
    "The statistics are brutal: most retail traders lose. But the reasons aren't what you think. It's not about intelligence or strategy — it's about process, risk management, and understanding market structure. Here's what separates consistent winners from everyone else.",
  category: "Trading Psychology",
  date: "April 2026",
  readTime: "8 min read",
  slug: "#",
};

const POSTS = [
  {
    title: "How to Read Dark Pool Prints Like Institutional Traders",
    excerpt:
      "Dark pool transactions reveal where smart money is positioning. Learn to decode block trades, sweep orders, and large lot prints to trade with the institutions.",
    category: "Order Flow",
    date: "April 2026",
    readTime: "6 min read",
    slug: "#",
  },
  {
    title: "The Complete Guide to IV Rank for Options Sellers",
    excerpt:
      "Implied volatility rank tells you when premiums are expensive. Learn how to use IVR, IV percentile, and the OrisTrade Options Seller's Sweet Spot indicator.",
    category: "Options",
    date: "April 2026",
    readTime: "7 min read",
    slug: "#",
  },
  {
    title: "Multi-Timeframe Analysis: The One Strategy Every Trader Needs",
    excerpt:
      "Aligning the M5, M15, H1, H4, and D1 timeframes is the foundation of every reliable trade. Here's how OrisTrade's Layer 2 scores timeframe confluence.",
    category: "Technical Analysis",
    date: "April 2026",
    readTime: "5 min read",
    slug: "#",
  },
  {
    title: "How Congressional Trades Predict Stock Movements",
    excerpt:
      "Politicians trade stocks — and their timing is suspiciously good. OrisTrade tracks every congressional trade via SEC filings. Here's what we've found.",
    category: "Insider Data",
    date: "April 2026",
    readTime: "6 min read",
    slug: "#",
  },
  {
    title: "Scalping the London Open: A 15-Minute Strategy",
    excerpt:
      "The London session open is one of the most volatile windows in forex. Here's a clean scalping setup using VWAP, volume spikes, and session range breakouts.",
    category: "Scalping",
    date: "April 2026",
    readTime: "5 min read",
    slug: "#",
  },
  {
    title: "Understanding the VIX: Your Market Fear Gauge",
    excerpt:
      "The VIX isn't just a number — it's a regime indicator. Learn how OrisTrade uses VIX levels to adjust signal confidence and identify risk-on vs risk-off environments.",
    category: "Macro",
    date: "April 2026",
    readTime: "5 min read",
    slug: "#",
  },
];

const CATEGORIES = [
  "All",
  "Order Flow",
  "Technical Analysis",
  "Options",
  "Scalping",
  "Macro",
  "Trading Psychology",
  "Insider Data",
  "Crypto",
];

export default function BlogPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="layer-badge mb-4 inline-block">BLOG & ANALYSIS</span>
          <h1 className="font-display font-black text-4xl md:text-6xl text-white leading-tight mb-6">
            Market Intelligence, <span className="text-gradient-gold">Decoded</span>
          </h1>
          <p className="text-brand-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            In-depth analysis, trading strategies, and educational content.
            Written to help you understand the markets — not just follow signals.
          </p>
        </div>
      </section>

      {/* Category filters */}
      <section className="px-4 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat}
                className={`text-sm px-4 py-2 rounded-full border transition-all duration-200 ${
                  i === 0
                    ? "bg-brand-gold/10 text-brand-gold border-brand-gold/30"
                    : "text-brand-muted border-brand-border hover:text-white hover:border-brand-gold/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <Link
            href={FEATURED_POST.slug}
            className="card block p-8 hover:border-brand-gold/40 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-brand-gold/10 text-brand-gold text-xs font-bold px-2 py-0.5 rounded-full border border-brand-gold/20">
                FEATURED
              </span>
              <span className="text-brand-muted text-xs">{FEATURED_POST.category}</span>
              <span className="text-brand-border text-xs">|</span>
              <span className="text-brand-muted text-xs">{FEATURED_POST.readTime}</span>
            </div>
            <h2 className="font-display font-bold text-white text-2xl md:text-3xl mb-3 group-hover:text-brand-gold transition-colors">
              {FEATURED_POST.title}
            </h2>
            <p className="text-brand-muted text-base leading-relaxed mb-4 max-w-3xl">
              {FEATURED_POST.excerpt}
            </p>
            <span className="text-brand-gold text-sm font-semibold group-hover:underline">
              Read full article →
            </span>
          </Link>
        </div>
      </section>

      {/* Post Grid */}
      <section className="py-16 px-4 bg-brand-card/30 border-y border-brand-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title text-center mb-10">Latest Articles</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {POSTS.map((post) => (
              <Link
                key={post.title}
                href={post.slug}
                className="card flex flex-col hover:border-brand-gold/30 transition-all duration-300 group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-brand-bg border border-brand-border text-brand-muted text-xs px-2 py-0.5 rounded-md">
                    {post.category}
                  </span>
                  <span className="text-brand-muted text-xs">{post.readTime}</span>
                </div>
                <h3 className="font-display font-bold text-white text-lg mb-2 group-hover:text-brand-gold transition-colors flex-1">
                  {post.title}
                </h3>
                <p className="text-brand-muted text-sm leading-relaxed mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-brand-muted border-t border-brand-border pt-3 mt-auto">
                  <span>{post.date}</span>
                  <span className="text-brand-gold font-semibold group-hover:underline">Read →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <span className="layer-badge mb-4 inline-block">NEWSLETTER</span>
          <h2 className="section-title">Get Weekly Market Analysis</h2>
          <p className="section-subtitle mb-8">
            Every Monday: market outlook, top signal setups, and educational content delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-white placeholder:text-brand-muted text-sm focus:outline-none focus:border-brand-gold/50 transition-colors"
            />
            <button className="btn-gold text-sm whitespace-nowrap">
              Subscribe →
            </button>
          </div>
          <p className="text-brand-muted text-xs mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>
    </>
  );
}
