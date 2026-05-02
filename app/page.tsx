'use client';

import { useState } from 'react';

const COURSES = [
  {
    id: 1,
    title: 'Trading Fundamentals',
    description: 'Learn the basics: chart types, timeframes, support/resistance, and risk management.',
    category: 'Fundamentals',
    level: 'Beginner',
    duration: '8 hours',
    tier: 'free',
    lessons: 12,
    icon: '📚',
  },
  {
    id: 2,
    title: 'Technical Analysis Mastery',
    description: 'Master moving averages, RSI, MACD, Bollinger Bands, and advanced indicators.',
    category: 'Technical Analysis',
    level: 'Intermediate',
    duration: '12 hours',
    tier: 'starter',
    lessons: 18,
    icon: '📊',
  },
  {
    id: 3,
    title: 'Smart Money Concepts',
    description: 'Order blocks, break of structure, market structure, and institutional trading patterns.',
    category: 'Advanced Concepts',
    level: 'Advanced',
    duration: '15 hours',
    tier: 'starter',
    lessons: 20,
    icon: '💡',
  },
  {
    id: 4,
    title: 'The OT Master Confluence System',
    description: 'Andy\'s proprietary 10-system confluence indicator: ATR channels, Supertrend, SMC, EMA ribbons, and EvoX scoring.',
    category: 'Proprietary',
    level: 'Advanced',
    duration: '20 hours',
    tier: 'pro',
    lessons: 25,
    icon: '⚡',
  },
  {
    id: 5,
    title: 'Options Selling Fundamentals',
    description: 'Spreads, Greeks, implied volatility, and how to manage credit spreads for consistent income.',
    category: 'Options',
    level: 'Intermediate',
    duration: '14 hours',
    tier: 'starter',
    lessons: 19,
    icon: '📈',
  },
  {
    id: 6,
    title: 'Scalping & Day Trading',
    description: 'High-frequency entry/exit setups: momentum, pullbacks, breakouts, and time management.',
    category: 'Day Trading',
    level: 'Intermediate',
    duration: '11 hours',
    tier: 'starter',
    lessons: 16,
    icon: '⚡',
  },
  {
    id: 7,
    title: 'Macro Trading & Economic Data',
    description: 'Fed policy, inflation, yield curves, correlation analysis, and macro-driven setups.',
    category: 'Macro',
    level: 'Advanced',
    duration: '16 hours',
    tier: 'pro',
    lessons: 21,
    icon: '🌍',
  },
  {
    id: 8,
    title: 'Psychology & Risk Management',
    description: 'Discipline, position sizing, stop placement, emotional control, and trading journals.',
    category: 'Mindset',
    level: 'Beginner',
    duration: '6 hours',
    tier: 'free',
    lessons: 10,
    icon: '🧠',
  },
  {
    id: 9,
    title: 'Pine Script for Traders',
    description: 'Code your own indicators and strategies: syntax, libraries, backtesting, and optimization.',
    category: 'Automation',
    level: 'Advanced',
    duration: '18 hours',
    tier: 'elite',
    lessons: 24,
    icon: '💻',
  },
];

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  free: { bg: '#0A0E1A', text: '#8892A4', border: '#252D45' },
  starter: { bg: '#1A2035', text: '#D4AF37', border: '#D4AF37' },
  pro: { bg: '#1A2035', text: '#00C851', border: '#00C851' },
  elite: { bg: '#1A2035', text: '#D4AF37', border: '#D4AF37' },
};

export default function CoursesPage() {
  const [filter, setFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);

  const filtered = COURSES.filter((c) => {
    if (filter && c.category !== filter) return false;
    if (levelFilter && c.level !== levelFilter) return false;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0A0E1A', color: '#fff', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '60px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px', color: '#D4AF37' }}>
            Trading Mastery
          </h1>
          <p style={{ fontSize: '18px', color: '#8892A4', lineHeight: '1.6' }}>
            Learn from Andy's 15+ years of trading experience. Master confluence analysis, order flow, macro trends, and the OrisTrade system.
          </p>
        </div>

        {/* Navigation */}
        <div style={{ marginBottom: '40px' }}>
          <a href="https://oristrade.com" style={{ color: '#D4AF37', textDecoration: 'none', fontSize: '14px' }}>
            ← Back to OrisTrade
          </a>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#8892A4', marginBottom: '8px', textTransform: 'uppercase' }}>
              Category
            </label>
            <select
              value={filter || ''}
              onChange={(e) => setFilter(e.target.value || null)}
              style={{
                padding: '10px 15px',
                background: '#1A2035',
                border: '1px solid #252D45',
                color: '#fff',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              <option value="">All Categories</option>
              <option value="Fundamentals">Fundamentals</option>
              <option value="Technical Analysis">Technical Analysis</option>
              <option value="Advanced Concepts">Advanced Concepts</option>
              <option value="Proprietary">Proprietary</option>
              <option value="Options">Options</option>
              <option value="Day Trading">Day Trading</option>
              <option value="Macro">Macro</option>
              <option value="Mindset">Mindset</option>
              <option value="Automation">Automation</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#8892A4', marginBottom: '8px', textTransform: 'uppercase' }}>
              Level
            </label>
            <select
              value={levelFilter || ''}
              onChange={(e) => setLevelFilter(e.target.value || null)}
              style={{
                padding: '10px 15px',
                background: '#1A2035',
                border: '1px solid #252D45',
                color: '#fff',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <p style={{ fontSize: '14px', color: '#8892A4' }}>
          {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Course Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {filtered.map((course) => {
            const colors = TIER_COLORS[course.tier];
            return (
              <div
                key={course.id}
                style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#D4AF37';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                {/* Icon */}
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{course.icon}</div>

                {/* Title */}
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: colors.text }}>
                  {course.title}
                </h3>

                {/* Description */}
                <p style={{ fontSize: '14px', color: '#8892A4', marginBottom: '16px', flex: 1, lineHeight: '1.5' }}>
                  {course.description}
                </p>

                {/* Meta */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#8892A4' }}>
                  <span>📖 {course.lessons} lessons</span>
                  <span>⏱️ {course.duration}</span>
                </div>

                {/* Level & Category */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      background: colors.border,
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: colors.text,
                      fontWeight: '600',
                    }}
                  >
                    {course.level}
                  </span>
                  <span
                    style={{
                      padding: '4px 10px',
                      background: '#252D45',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#8892A4',
                    }}
                  >
                    {course.category}
                  </span>
                </div>

                {/* Tier Badge */}
                <div
                  style={{
                    padding: '8px 12px',
                    background: colors.border,
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: colors.text,
                    fontWeight: '600',
                    textAlign: 'center',
                    marginBottom: '12px',
                  }}
                >
                  {course.tier === 'free' ? '🎁 Free' : `${course.tier.charAt(0).toUpperCase() + course.tier.slice(1)} Tier`}
                </div>

                {/* CTA */}
                <button
                  onClick={() => {
                    const url =
                      course.tier === 'free'
                        ? `https://app.oristrade.com/education?course=${course.id}`
                        : `https://app.oristrade.com/pricing?course=${course.id}`;
                    window.location.href = url;
                  }}
                  style={{
                    padding: '10px 16px',
                    background: colors.text,
                    color: '#0A0E1A',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  {course.tier === 'free' ? 'Start Free' : 'View Pricing'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ maxWidth: '1200px', margin: '80px auto 0', padding: '40px 0', borderTop: '1px solid #252D45', textAlign: 'center', fontSize: '14px', color: '#8892A4' }}>
        <p>All courses include lifetime access • Updated quarterly • Community support</p>
      </div>
    </div>
  );
}
