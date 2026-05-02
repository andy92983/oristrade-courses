'use client';

import { useState } from 'react';

const BLOG_POSTS = [
  {
    id: 1,
    title: 'The 12-Layer Signal Engine: How OrisTrade Scores Every Setup',
    slug: 'signal-engine-explained',
    excerpt: 'Understanding the confluence system that powers OrisTrade signals: order flow, technicals, macro, sentiment, and more.',
    date: '2026-04-20',
    author: 'Andy Bergstrom',
    category: 'Signals',
    readTime: '8 min',
    image: '📊',
  },
  {
    id: 2,
    title: 'Smart Money Concepts: BOS, ChoCh, and Order Blocks',
    slug: 'smart-money-concepts',
    excerpt: 'Decode institutional trading patterns. Learn break of structure, change of character, and how order blocks predict reversals.',
    date: '2026-04-18',
    author: 'Andy Bergstrom',
    category: 'Technical Analysis',
    readTime: '12 min',
    image: '💡',
  },
  {
    id: 3,
    title: 'Options Selling in High Volatility: Greeks, Theta, and Position Management',
    slug: 'options-high-volatility',
    excerpt: 'How to scale credit spreads when VIX spikes. Managing delta, gamma risk, and early assignment.',
    date: '2026-04-16',
    author: 'Andy Bergstrom',
    category: 'Options',
    readTime: '10 min',
    image: '📈',
  },
  {
    id: 4,
    title: 'Backtesting vs. Paper Trading: Why One Is Not Enough',
    slug: 'backtesting-vs-paper',
    excerpt: 'The gap between historical backtest results and live execution. Real case studies from trading strategies.',
    date: '2026-04-14',
    author: 'Andy Bergstrom',
    category: 'Trading Psychology',
    readTime: '9 min',
    image: '🧠',
  },
  {
    id: 5,
    title: 'ATR, Bands, and Channels: Why OrisTrade Uses Multi-Level Confirmation',
    slug: 'atr-bands-confluence',
    excerpt: 'Deep dive into the OT Master Confluence indicator: ATR channel bands, Supertrend, and the EvoX scoring system.',
    date: '2026-04-12',
    author: 'Andy Bergstrom',
    category: 'Indicators',
    readTime: '11 min',
    image: '⚡',
  },
  {
    id: 6,
    title: 'Macro Driven Setups: Using FRED Data for Swing Trades',
    slug: 'macro-fred-setups',
    excerpt: 'How Fed policy, inflation, and yield curves create predictable swing trade opportunities.',
    date: '2026-04-10',
    author: 'Andy Bergstrom',
    category: 'Macro Trading',
    readTime: '13 min',
    image: '🌍',
  },
  {
    id: 7,
    title: 'Scalping ES1! on the 1-Min: Entry, Exit, and Risk Rules',
    slug: 'es-scalping-rules',
    excerpt: 'Executable micro-scalping strategy: momentum divergence + volume confirmation + strict 10-second exits.',
    date: '2026-04-08',
    author: 'Andy Bergstrom',
    category: 'Day Trading',
    readTime: '7 min',
    image: '⚡',
  },
  {
    id: 8,
    title: 'The Difference Between Noise and Signal: A Trader\'s Guide',
    slug: 'signal-vs-noise',
    excerpt: 'Why most traders lose: they trade every setup. We wait for confluence. Here\'s how to filter.',
    date: '2026-04-06',
    author: 'Andy Bergstrom',
    category: 'Trading Psychology',
    readTime: '10 min',
    image: '🔍',
  },
];

const CATEGORIES = ['All', 'Signals', 'Technical Analysis', 'Options', 'Trading Psychology', 'Indicators', 'Macro Trading', 'Day Trading'];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = selectedCategory === 'All' ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.category === selectedCategory);

  return (
    <div style={{ minHeight: '100vh', background: '#0A0E1A', color: '#fff', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ maxWidth: '900px', margin: '0 auto', marginBottom: '60px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px', color: '#D4AF37' }}>
            OrisTrade Blog
          </h1>
          <p style={{ fontSize: '18px', color: '#8892A4', lineHeight: '1.6' }}>
            Trading insights, strategy breakdowns, and market analysis from Andy. Updated weekly.
          </p>
        </div>

        {/* Navigation */}
        <div style={{ marginBottom: '40px' }}>
          <a href="https://courses.oristrade.com" style={{ color: '#D4AF37', textDecoration: 'none', fontSize: '14px' }}>
            ← Back to Courses
          </a>
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                background: selectedCategory === cat ? '#D4AF37' : '#1A2035',
                color: selectedCategory === cat ? '#0A0E1A' : '#D4AF37',
                border: `1px solid ${selectedCategory === cat ? '#D4AF37' : '#252D45'}`,
                borderRadius: '4px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== cat) {
                  e.currentTarget.style.borderColor = '#D4AF37';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== cat) {
                  e.currentTarget.style.borderColor = '#252D45';
                }
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <p style={{ fontSize: '14px', color: '#8892A4' }}>
          {filtered.length} article{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Articles Grid */}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {filtered.map((post) => (
            <article
              key={post.id}
              style={{
                background: '#1A2035',
                border: '1px solid #252D45',
                borderRadius: '8px',
                padding: '24px',
                display: 'flex',
                gap: '24px',
                transition: 'all 0.3s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#D4AF37';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#252D45';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              {/* Icon */}
              <div style={{ fontSize: '48px', minWidth: '60px', textAlign: 'center' }}>{post.image}</div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                {/* Meta */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px', fontSize: '13px', color: '#8892A4' }}>
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                  <span>•</span>
                  <span
                    style={{
                      padding: '2px 8px',
                      background: '#252D45',
                      borderRadius: '3px',
                      color: '#D4AF37',
                      fontWeight: '600',
                    }}
                  >
                    {post.category}
                  </span>
                </div>

                {/* Title */}
                <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '8px', color: '#fff', lineHeight: '1.4' }}>
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p style={{ fontSize: '15px', color: '#8892A4', marginBottom: '12px', lineHeight: '1.6' }}>
                  {post.excerpt}
                </p>

                {/* Author */}
                <p style={{ fontSize: '13px', color: '#8892A4' }}>
                  by <span style={{ color: '#D4AF37', fontWeight: '600' }}>{post.author}</span>
                </p>
              </div>

              {/* CTA Arrow */}
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '24px', color: '#D4AF37' }}>→</div>
            </article>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div style={{ maxWidth: '900px', margin: '80px auto 0', padding: '40px', background: '#1A2035', border: '1px solid #252D45', borderRadius: '8px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#D4AF37' }}>
          Get Trading Insights Weekly
        </h3>
        <p style={{ fontSize: '15px', color: '#8892A4', marginBottom: '24px' }}>
          Join 1,000+ traders receiving Andy's analysis, setup breakdowns, and signal explanations.
        </p>
        <div style={{ display: 'flex', gap: '12px', maxWidth: '400px', margin: '0 auto' }}>
          <input
            type="email"
            placeholder="your@email.com"
            style={{
              flex: 1,
              padding: '12px 16px',
              background: '#0A0E1A',
              border: '1px solid #252D45',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '14px',
            }}
          />
          <button
            style={{
              padding: '12px 24px',
              background: '#D4AF37',
              color: '#0A0E1A',
              border: 'none',
              borderRadius: '4px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Subscribe
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ maxWidth: '900px', margin: '80px auto 0', padding: '40px 0', borderTop: '1px solid #252D45', textAlign: 'center', fontSize: '14px', color: '#8892A4' }}>
        <p>© 2026 OrisTrade | All insights for educational purposes</p>
      </div>
    </div>
  );
}
