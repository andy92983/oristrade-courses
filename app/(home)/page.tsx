'use client';

const COURSES = [
  {
    num: "01",
    title: "Trading Fundamentals",
    level: "Beginner",
    lessons: 12,
    duration: "4 hrs",
    icon: "📚",
    desc: "The bedrock. Chart types, timeframes, support/resistance, position sizing, risk management. Build the mental model before you touch a strategy.",
    topics: ["Chart anatomy", "Timeframes", "Support/Resistance", "Risk per trade"],
  },
  {
    num: "02",
    title: "Technical Analysis Mastery",
    level: "Intermediate",
    lessons: 18,
    duration: "8 hrs",
    icon: "📊",
    desc: "Moving averages, RSI, MACD, Bollinger Bands, Fibonacci, advanced divergence. Learn what each indicator says — and when to ignore it.",
    topics: ["EMA stacks", "RSI divergence", "MACD signals", "Fib retracement"],
  },
  {
    num: "03",
    title: "Smart Money Concepts",
    level: "Advanced",
    lessons: 20,
    duration: "10 hrs",
    icon: "💡",
    desc: "Read the market like a desk trader. Order blocks, break of structure, change of character, liquidity pools, institutional footprints.",
    topics: ["Order blocks", "BOS / ChoCh", "Liquidity grabs", "Premium / discount"],
  },
  {
    num: "04",
    title: "OT Master Confluence",
    level: "Advanced",
    lessons: 25,
    duration: "12 hrs",
    icon: "⚡",
    desc: "Andy's proprietary 11-system Pine Script. Learn how each system works, how they combine, and how to take only the highest-conviction trades.",
    topics: ["AlgoPro", "EvoX scoring", "FVVO alignment", "Session gating"],
    featured: true,
  },
  {
    num: "05",
    title: "Options Selling Fundamentals",
    level: "Intermediate",
    lessons: 19,
    duration: "9 hrs",
    icon: "📈",
    desc: "Make money when nothing happens. Credit spreads, iron condors, Greeks, IV management, defensive adjustments, real position sizing.",
    topics: ["Credit spreads", "Greeks", "IV percentile", "Adjustments"],
  },
  {
    num: "06",
    title: "Scalping & Day Trading",
    level: "Intermediate",
    lessons: 16,
    duration: "7 hrs",
    icon: "⚡",
    desc: "Short timeframes, fast executions. Momentum entries, breakout structure, time of day, volume profile, and managing P&L under pressure.",
    topics: ["Momentum", "Breakouts", "TOD bias", "Volume profile"],
  },
];

const ARTICLES = [
  {
    title: "The 12-Layer Signal Engine: How OrisTrade Scores Every Setup",
    date: "May 1, 2026",
    category: "System",
    readTime: "8 min",
    excerpt: "A breakdown of how order flow, technicals, macro, sentiment, and AI combine into a single confluence score from 0 to 100.",
  },
  {
    title: "Smart Money Concepts: BOS, ChoCh, and Order Blocks Explained",
    date: "Apr 29, 2026",
    category: "Technical Analysis",
    readTime: "12 min",
    excerpt: "Stop trading retail patterns. Learn how institutions actually move price and how to position behind their footprints.",
  },
  {
    title: "Options Selling in High Volatility: The Theta Edge",
    date: "Apr 27, 2026",
    category: "Options",
    readTime: "10 min",
    excerpt: "When VIX spikes, premium fattens. Here's how to harvest that premium without blowing up on the next gap.",
  },
  {
    title: "Backtesting vs. Paper Trading: Why One Is Not Enough",
    date: "Apr 25, 2026",
    category: "Psychology",
    readTime: "9 min",
    excerpt: "Backtests don't fail. Traders fail. The forward test is where the system meets the trader's nervous system.",
  },
];

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-brand-bg text-white overflow-x-hidden">
      {/* Top Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-brand-bg/80 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="https://oristrade.com" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-gold to-brand-gold-light flex items-center justify-center font-display font-black text-brand-bg text-lg">
              O
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              Oris<span className="text-brand-gold">Trade</span>
            </span>
            <span className="hidden sm:inline-block text-brand-muted text-sm border-l border-brand-border pl-3 ml-2">Learning Hub</span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#courses" className="text-brand-muted hover:text-white transition-colors">Courses</a>
            <a href="#blog" className="text-brand-muted hover:text-white transition-colors">Blog</a>
            <a href="https://oristrade.com#pricing" className="text-brand-muted hover:text-white transition-colors">Pricing</a>
            <a href="https://journal.oristrade.com" className="text-brand-muted hover:text-white transition-colors">Journal</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://app.oristrade.com/login" className="text-sm font-medium text-brand-muted hover:text-white transition-colors hidden sm:inline">Log in</a>
            <a href="https://app.oristrade.com/signup" className="btn-gold text-sm py-2 px-4">Start Free</a>
          </div>
        </div>
      </nav>

      {/* Editorial Hero */}
      <section className="relative pt-32 pb-20 px-6 border-b border-brand-border">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] rounded-full bg-brand-gold/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-6 text-xs text-brand-muted uppercase tracking-[0.2em]">
              <span className="w-8 h-px bg-brand-gold" />
              <span>Issue 04 · Spring 2026</span>
              <span className="w-8 h-px bg-brand-gold" />
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-8xl font-black leading-[0.95] mb-8 tracking-tight">
              Master the
              <br />
              <span className="italic font-light text-brand-muted">art of</span>{" "}
              <span className="text-gradient-gold">trading.</span>
            </h1>

            <p className="text-brand-muted text-lg lg:text-xl max-w-2xl leading-relaxed mb-10">
              Six structured courses. Hundreds of hours of curated wisdom. From the very first candle to institutional-grade strategy. Taught by a veteran with fifteen years in the trenches.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a href="#courses" className="btn-gold">Browse Courses →</a>
              <a href="https://app.oristrade.com/signup" className="btn-outline">Sign Up Free</a>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-brand-card border border-brand-border rounded-2xl p-6">
              <div className="text-xs text-brand-muted uppercase tracking-wider mb-4">By the numbers</div>
              <div className="space-y-5">
                {[
                  { val: "6", label: "Structured courses" },
                  { val: "110", label: "Total lessons" },
                  { val: "50+", label: "Hours of content" },
                  { val: "15", label: "Years of experience" },
                ].map((s) => (
                  <div key={s.label} className="flex items-baseline justify-between border-b border-brand-border/50 pb-3 last:border-0 last:pb-0">
                    <div className="text-sm text-brand-muted">{s.label}</div>
                    <div className="font-display text-3xl font-black text-brand-gold tabular-nums">{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section id="courses" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <div>
              <div className="text-brand-gold text-sm font-bold uppercase tracking-wider mb-3">The Curriculum</div>
              <h2 className="font-display text-4xl md:text-5xl font-black leading-tight">
                Six paths.
                <br />
                <span className="text-brand-muted">One trader.</span>
              </h2>
            </div>
            <p className="text-brand-muted text-base max-w-md">
              Each course builds on the last. Start at fundamentals or jump to your level. Lifetime access — go at your pace, not ours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES.map((course) => (
              <article
                key={course.num}
                className={`group relative rounded-2xl p-8 transition-all duration-300 overflow-hidden ${
                  course.featured
                    ? "bg-gradient-to-br from-brand-gold/10 via-brand-card to-brand-card border-2 border-brand-gold shadow-2xl shadow-brand-gold/10"
                    : "bg-brand-card border border-brand-border hover:border-brand-gold/40 hover:-translate-y-1"
                }`}
              >
                {course.featured && (
                  <div className="absolute top-4 right-4 bg-brand-gold text-brand-bg text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
                    Signature
                  </div>
                )}

                <div className="flex items-start justify-between mb-6">
                  <div className="font-mono text-sm text-brand-gold/70 font-bold">L{course.num}</div>
                  <div className="text-3xl">{course.icon}</div>
                </div>

                <h3 className="font-display text-2xl font-bold mb-3 leading-tight">{course.title}</h3>
                <p className="text-sm text-brand-muted leading-relaxed mb-5 min-h-[5rem]">{course.desc}</p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {course.topics.map((t) => (
                    <span key={t} className="text-[11px] bg-brand-bg/60 border border-brand-border px-2 py-1 rounded text-brand-muted">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-brand-border pt-5">
                  <div className="flex items-center gap-3 text-xs text-brand-muted">
                    <span className="layer-badge">{course.level}</span>
                    <span>{course.lessons} lessons</span>
                    <span>·</span>
                    <span>{course.duration}</span>
                  </div>
                  <a
                    href="https://app.oristrade.com/education"
                    className="text-brand-gold text-sm font-bold opacity-60 group-hover:opacity-100 transition-opacity"
                    aria-label={`View ${course.title}`}
                  >
                    →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why Learn With Us */}
      <section className="py-24 px-6 bg-brand-card/30 border-y border-brand-border relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <div className="text-brand-gold text-sm font-bold uppercase tracking-wider mb-3">The Difference</div>
              <h2 className="font-display text-4xl md:text-5xl font-black leading-tight mb-6">
                Not another YouTube guru.
              </h2>
              <p className="text-brand-muted text-lg leading-relaxed mb-8">
                You've watched the videos. Read the books. Taken the courses. Still losing money. The problem isn't more content — it's connected content. A real curriculum, taught by someone who's actually traded for fifteen years.
              </p>
              <a href="https://app.oristrade.com/about" className="text-brand-gold font-bold inline-flex items-center gap-2 hover:gap-3 transition-all">
                About the founder <span>→</span>
              </a>
            </div>
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
              {[
                { icon: "🎓", title: "Structured Curriculum", desc: "Six courses build on each other. No random tutorials. A real path from beginner to institutional-level." },
                { icon: "📈", title: "Real Examples Only", desc: "Every concept demonstrated with live charts and real P&L. No theoretical fairy tales." },
                { icon: "👨‍🏫", title: "15-Year Veteran", desc: "Forex, futures, options, crypto. Bull markets, bear markets, flash crashes. Survived all of them." },
                { icon: "♾️", title: "Lifetime Access", desc: "Pay once, learn forever. Updated quarterly with new market insights and system improvements." },
              ].map((b) => (
                <div key={b.title} className="bg-brand-card border border-brand-border rounded-xl p-6 hover:border-brand-gold/40 transition-colors">
                  <div className="text-3xl mb-4">{b.icon}</div>
                  <h3 className="font-display font-bold text-lg mb-2">{b.title}</h3>
                  <p className="text-sm text-brand-muted leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog / Articles */}
      <section id="blog" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-16">
            <div>
              <div className="text-brand-gold text-sm font-bold uppercase tracking-wider mb-3">The Blog</div>
              <h2 className="font-display text-4xl md:text-5xl font-black leading-tight">
                Latest reads.
              </h2>
            </div>
            <a href="https://app.oristrade.com/blog" className="text-brand-gold font-bold hover:text-brand-gold-light hidden sm:inline-flex items-center gap-2">
              All articles →
            </a>
          </div>

          {/* Featured + grid */}
          <div className="grid lg:grid-cols-12 gap-8 mb-8">
            {/* Featured article */}
            <a href="#" className="lg:col-span-7 group relative rounded-2xl overflow-hidden border border-brand-border hover:border-brand-gold/40 transition-colors bg-gradient-to-br from-brand-card to-brand-bg">
              <div className="aspect-[16/10] bg-gradient-to-br from-brand-gold/20 via-brand-card to-brand-bg flex items-center justify-center text-8xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,175,55,0.15),transparent_60%)]" />
                <span className="relative">📊</span>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 text-xs text-brand-muted uppercase tracking-wider mb-4">
                  <span className="text-brand-gold font-bold">{ARTICLES[0].category}</span>
                  <span>·</span>
                  <span>{ARTICLES[0].date}</span>
                  <span>·</span>
                  <span>{ARTICLES[0].readTime} read</span>
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold mb-3 group-hover:text-brand-gold transition-colors leading-tight">
                  {ARTICLES[0].title}
                </h3>
                <p className="text-brand-muted leading-relaxed">{ARTICLES[0].excerpt}</p>
              </div>
            </a>

            {/* Side articles */}
            <div className="lg:col-span-5 space-y-4">
              {ARTICLES.slice(1).map((article) => (
                <a
                  key={article.title}
                  href="#"
                  className="block bg-brand-card border border-brand-border rounded-xl p-6 hover:border-brand-gold/40 transition-colors group"
                >
                  <div className="flex items-center gap-2 text-xs text-brand-muted uppercase tracking-wider mb-2">
                    <span className="text-brand-gold font-bold">{article.category}</span>
                    <span>·</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2 group-hover:text-brand-gold transition-colors leading-snug">
                    {article.title}
                  </h3>
                  <div className="text-xs text-brand-muted">{article.date}</div>
                </a>
              ))}
            </div>
          </div>

          <div className="text-center sm:hidden">
            <a href="https://app.oristrade.com/blog" className="text-brand-gold font-bold">
              All articles →
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-6 bg-brand-card/30 border-y border-brand-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-brand-gold text-sm font-bold uppercase tracking-wider mb-3">The Newsletter</div>
          <h2 className="font-display text-3xl md:text-4xl font-black mb-4">
            One trade. Once a week. Free.
          </h2>
          <p className="text-brand-muted mb-8 max-w-xl mx-auto">
            Every Sunday, the highest-conviction setup of the week. Entry, target, stop, and the reasoning behind it. No spam.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="you@email.com"
              className="flex-1 bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-gold"
            />
            <button type="submit" className="btn-gold">Subscribe</button>
          </form>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 via-transparent to-brand-green/5 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-6xl font-black mb-6 leading-tight">
            Start at <span className="text-gradient-gold">lesson one.</span>
          </h2>
          <p className="text-brand-muted text-lg md:text-xl mb-10 max-w-xl mx-auto">
            All courses included with the Starter tier. Free preview lessons available — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://app.oristrade.com/signup" className="btn-gold">Create Free Account →</a>
            <a href="https://oristrade.com#pricing" className="btn-outline">View Pricing</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-border py-12 px-6">
        <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brand-muted">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-brand-gold to-brand-gold-light flex items-center justify-center font-display font-black text-brand-bg text-sm">O</div>
            <span>© 2026 OrisTrade · Learning Hub</span>
          </div>
          <div className="flex gap-6">
            <a href="https://oristrade.com" className="hover:text-white">Home</a>
            <a href="https://app.oristrade.com" className="hover:text-white">Dashboard</a>
            <a href="https://journal.oristrade.com" className="hover:text-white">Journal</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
