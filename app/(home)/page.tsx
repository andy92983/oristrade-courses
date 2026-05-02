'use client';

export default function CoursesPage() {
  const courses = [
    { num: 1, title: "Trading Fundamentals", level: "Beginner", lessons: 12, icon: "📚", desc: "Chart types, timeframes, support/resistance, risk management" },
    { num: 2, title: "Technical Analysis Mastery", level: "Intermediate", lessons: 18, icon: "📊", desc: "Moving averages, RSI, MACD, Bollinger Bands, advanced indicators" },
    { num: 3, title: "Smart Money Concepts", level: "Advanced", lessons: 20, icon: "💡", desc: "Order blocks, break of structure, institutional trading patterns" },
    { num: 4, title: "OT Master Confluence System", level: "Advanced", lessons: 25, icon: "⚡", desc: "Andy's proprietary 10-system indicator with live examples" },
    { num: 5, title: "Options Selling Fundamentals", level: "Intermediate", lessons: 19, icon: "📈", desc: "Spreads, Greeks, IV management, credit spread rules" },
    { num: 6, title: "Scalping & Day Trading", level: "Intermediate", lessons: 16, icon: "⚡", desc: "High-frequency entries, momentum, breakouts, time management" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-brand-gold text-sm font-medium">📚 Learning Hub</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Master Trading <span className="text-brand-gold">From Scratch</span>
          </h1>
          <p className="text-xl text-brand-muted mb-10 leading-relaxed">
            Structured courses from fundamentals to advanced strategies. Learn confluence analysis, smart money concepts, options selling, macro trading, and the OrisTrade system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://app.oristrade.com/signup"
              className="inline-block bg-brand-gold text-brand-bg font-bold py-4 px-8 rounded-lg hover:opacity-90 transition-opacity"
            >
              Sign Up & Start Learning →
            </a>
            <a
              href="#blog"
              className="inline-block border-2 border-brand-gold text-brand-gold font-bold py-4 px-8 rounded-lg hover:bg-brand-gold/10 transition-colors"
            >
              Read Blog
            </a>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.num} className="bg-brand-card border border-brand-border rounded-lg p-8 hover:border-brand-gold/50 transition-colors">
                <div className="text-5xl mb-4">{course.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                <p className="text-brand-muted text-sm mb-6">{course.desc}</p>
                <div className="flex items-center justify-between text-sm text-brand-muted mb-6">
                  <span className="bg-brand-border px-3 py-1 rounded text-brand-gold font-medium">{course.level}</span>
                  <span>{course.lessons} lessons</span>
                </div>
                <a
                  href="https://app.oristrade.com/education"
                  className="block text-center py-2 px-4 border border-brand-gold text-brand-gold rounded hover:bg-brand-gold/10 transition-colors font-medium text-sm"
                >
                  View Course →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-20 px-4 bg-brand-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-4xl font-bold text-white">Latest Articles</h2>
            <a href="#" className="text-brand-gold font-bold hover:text-brand-gold/80">
              View All →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "The 12-Layer Signal Engine: How OrisTrade Scores Every Setup",
                date: "May 1, 2026",
                category: "Signals",
                readTime: "8 min",
                icon: "📊",
              },
              {
                title: "Smart Money Concepts: BOS, ChoCh, and Order Blocks",
                date: "Apr 29, 2026",
                category: "Technical Analysis",
                readTime: "12 min",
                icon: "💡",
              },
              {
                title: "Options Selling in High Volatility: Greeks, Theta, and Position Management",
                date: "Apr 27, 2026",
                category: "Options",
                readTime: "10 min",
                icon: "📈",
              },
              {
                title: "Backtesting vs. Paper Trading: Why One Is Not Enough",
                date: "Apr 25, 2026",
                category: "Trading Psychology",
                readTime: "9 min",
                icon: "🧠",
              },
            ].map((article, idx) => (
              <a
                key={idx}
                href="#"
                className="group bg-brand-card border border-brand-border rounded-lg p-6 hover:border-brand-gold/50 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-3xl">{article.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-brand-muted mb-2">
                      <span>{article.date}</span>
                      <span>•</span>
                      <span className="text-brand-gold font-medium">{article.category}</span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-brand-gold transition-colors">
                      {article.title}
                    </h3>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Why Learn with Us */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Why Learn With OrisTrade?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="border-l-4 border-brand-gold pl-6">
              <h3 className="text-2xl font-bold text-white mb-3">🎓 Comprehensive Curriculum</h3>
              <p className="text-brand-muted">
                From complete beginner to advanced trader. Every course builds on the previous, creating a complete learning path from basics to institutional-level strategies.
              </p>
            </div>
            <div className="border-l-4 border-brand-gold pl-6">
              <h3 className="text-2xl font-bold text-white mb-3">📈 Real-World Examples</h3>
              <p className="text-brand-muted">
                Every lesson uses live market examples. See actual trades, live signals, and real profit/loss numbers. Learn the concepts that actually move markets.
              </p>
            </div>
            <div className="border-l-4 border-brand-gold pl-6">
              <h3 className="text-2xl font-bold text-white mb-3">👨‍🏫 Taught by a Veteran Trader</h3>
              <p className="text-brand-muted">
                15+ years of professional trading experience. Forex, futures, options, crypto. Learn the systems that have survived bull and bear markets.
              </p>
            </div>
            <div className="border-l-4 border-brand-gold pl-6">
              <h3 className="text-2xl font-bold text-white mb-3">⏰ Lifetime Access</h3>
              <p className="text-brand-muted">
                Watch courses at your own pace. Rewatch whenever you need. Updated quarterly with new market insights and system improvements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-brand-card/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Start Learning Today</h2>
          <p className="text-brand-muted text-lg mb-10">
            All courses included with Starter tier ($49/mo) or upgrade anytime.
          </p>
          <a
            href="https://app.oristrade.com/signup"
            className="inline-block bg-brand-gold text-brand-bg font-bold py-4 px-10 rounded-lg hover:opacity-90 transition-opacity text-lg"
          >
            Create Free Account & Browse Courses →
          </a>
        </div>
      </section>
    </>
  );
}
