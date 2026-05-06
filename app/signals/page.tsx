"use client";

import { useState } from "react";
import Link from "next/link";
import { SignalCard } from "../../components/signals/signalcard";
import type { Signal } from "../../components/signals/signalcard";
import { useAuth } from "../../lib/supabase/useAuth";

// ─── Demo signals — April 11, 2026 ───────────────────────────────────────────
// Illustrative examples reflecting current market structure.
// Live signals will stream from TradingView → Worker KV once Phase 2 is active.
const DEMO_SIGNALS: Signal[] = [
  {
    symbol: "GOLD (GC1!)",
    timeframe: "1H",
    score: 88,
    direction: "STRONG_BUY",
    entry: 3228.50,
    stopLoss: 3186.00,
    target1: 3290.00,
    target2: 3355.00,
    rrRatio: "1:2.3",
    reasons: [
      { text: "Record safe-haven demand as tariff uncertainty persists", type: "positive" },
      { text: "DXY at multi-year lows — dollar weakness is a direct tailwind", type: "positive" },
      { text: "Real yields falling — inverse correlation with gold fully active", type: "positive" },
      { text: "Central bank buying (China, India) adding structural bid", type: "positive" },
      { text: "Extended ATR — reduce position size 25% vs normal", type: "warning" },
    ],
    timestamp: "Apr 11, 2026 · Example",
    locked: false,
  },
  {
    symbol: "EUR/USD",
    timeframe: "4H",
    score: 79,
    direction: "BUY",
    entry: 1.1142,
    stopLoss: 1.1088,
    target1: 1.1220,
    target2: 1.1310,
    rrRatio: "1:2.1",
    reasons: [
      { text: "DXY breaking key support — broad dollar weakness", type: "positive" },
      { text: "Price above 200 EMA on H4 and D1 — trend confirmed", type: "positive" },
      { text: "RSI reset from 72 → 54 — fresh room to run higher", type: "positive" },
      { text: "Retail sentiment: 78% short EUR/USD — strong contrarian long", type: "positive" },
      { text: "ECB policy divergence risk — monitor closely", type: "warning" },
    ],
    timestamp: "Apr 11, 2026 · Example",
    locked: false,
  },
  {
    symbol: "QQQ",
    timeframe: "1H",
    score: 61,
    direction: "BUY",
    entry: 611.20,
    stopLoss: 598.50,
    target1: 628.00,
    target2: 644.00,
    rrRatio: "1:1.9",
    reasons: [
      { text: "Tariff 90-day pause triggered bounce from demand zone", type: "positive" },
      { text: "VWAP reclaimed and holding — institutions are buying", type: "positive" },
      { text: "Mega-cap tech earnings revisions holding up", type: "positive" },
      { text: "VIX elevated at 38 — vol contraction favors longs", type: "warning" },
      { text: "Trade war escalation remains a tail risk — tight SL", type: "warning" },
    ],
    timestamp: "Apr 11, 2026 · Example",
    locked: false,
  },
  {
    symbol: "SPY",
    timeframe: "4H",
    score: 48,
    direction: "WAIT",
    entry: 527.80,
    stopLoss: 518.20,
    target1: 540.00,
    target2: 552.50,
    rrRatio: "1:1.6",
    reasons: [
      { text: "S&P 500 at key resistance after post-tariff relief bounce", type: "warning" },
      { text: "Mixed breadth — mega-cap carrying the index", type: "warning" },
      { text: "CPI data Thursday — holding off until macro clears", type: "warning" },
      { text: "Recession probability elevated — no conviction yet", type: "negative" },
    ],
    timestamp: "Apr 11, 2026 · Example",
    locked: false,
  },
  {
    symbol: "BTC/USDT",
    timeframe: "4H",
    score: 66,
    direction: "BUY",
    entry: 82650.0,
    stopLoss: 79400.0,
    target1: 87800.0,
    target2: 93500.0,
    rrRatio: "1:2.0",
    reasons: [
      { text: "Crypto Fear & Greed recovering from 28 (Extreme Fear) to 42", type: "positive" },
      { text: "Holding above $80K accumulation zone — strong support", type: "positive" },
      { text: "Post-halving supply reduction still in structural effect", type: "positive" },
      { text: "Funding rates neutral — no over-leveraged longs to flush", type: "positive" },
      { text: "Correlation with risk-off Nasdaq adds downside exposure", type: "warning" },
    ],
    timestamp: "Apr 11, 2026 · Example",
    locked: false,
  },
  {
    symbol: "USD/JPY",
    timeframe: "1H",
    score: 24,
    direction: "SELL",
    entry: 143.20,
    stopLoss: 144.60,
    target1: 141.40,
    target2: 139.80,
    rrRatio: "1:2.0",
    reasons: [
      { text: "BOJ hiking cycle continues — yen carry unwind accelerating", type: "negative" },
      { text: "DXY breakdown amplifying USD weakness across pairs", type: "negative" },
      { text: "Bearish momentum divergence on RSI (H4 and D1)", type: "negative" },
      { text: "COT commercials heavily net short USD — institutional flow aligned", type: "negative" },
      { text: "Intervention risk if JPY strengthens too fast", type: "warning" },
    ],
    timestamp: "Apr 11, 2026 · Example",
    locked: false,
  },
];

const FILTERS = ["All Markets", "Forex", "Futures", "Crypto"];

export default function SignalsPage() {
  const [activeFilter, setActiveFilter] = useState("All Markets");
  const { user, profile, loading, profileLoading } = useAuth();

  // While auth is still resolving, show as locked (will animate open once known)
  // Admins + any logged-in member get full access
  const isFullyLoaded = !loading && !profileLoading;
  const isUnlocked    = isFullyLoaded && (!!user);
  const signals = DEMO_SIGNALS.map((s) => ({ ...s, locked: false })); // Demo signals unlocked for all

  return (
    <>
      {/* Hero */}
      <section className="pt-20 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="layer-badge mb-4 inline-block">SIGNAL ENGINE</span>
          <h1 className="font-display font-black text-5xl md:text-7xl text-white leading-tight mb-4">
            The OrisTrade <span className="text-gradient-gold">Signal Engine</span>
          </h1>
          <p className="text-brand-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Multi-layer confluence scoring gives you a clear 0–100 score with entry, stop loss, and targets.
            No guesswork. Plain English explanations for every signal.
          </p>
        </div>
      </section>

      {/* Auth loading indicator */}
      {!isFullyLoaded && (
        <section className="px-4 pb-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-brand-card border border-brand-border rounded-xl px-5 py-3 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin flex-shrink-0" />
              <span className="text-brand-muted text-sm">Verifying membership…</span>
            </div>
          </div>
        </section>
      )}

      {/* Member banner */}
      {isFullyLoaded && user && (
        <section className="px-4 pb-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-brand-green/10 border border-brand-green/30 rounded-xl px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-brand-green text-sm">✓</span>
                <span className="text-white text-sm font-medium">
                  Logged in as member — signals unlocked below.{" "}
                  <span className="text-brand-muted font-normal">
                    These are example signals. Live signals feed from your TradingView setup via the dashboard.
                  </span>
                </span>
              </div>
              <Link href="https://app.oristrade.com/dashboard" className="btn-gold text-xs py-2 px-4 whitespace-nowrap flex-shrink-0">
                Go to Live Dashboard →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Guest banner */}
      {isFullyLoaded && !user && (
        <section className="px-4 pb-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-xl px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-brand-muted text-sm">
                <span className="text-white font-medium">Join free</span> to unlock all signal details — entry, stop loss, targets, and reasoning.
              </p>
              <div className="flex gap-2">
                <Link href="/signup" className="btn-gold text-xs py-2 px-4">Sign Up Free →</Link>
                <Link href="/login" className="btn-outline text-xs py-2 px-4">Log In</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="px-4 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`text-sm px-4 py-2 rounded-full border transition-all duration-200 ${
                  activeFilter === f
                    ? "bg-brand-gold/10 text-brand-gold border-brand-gold/30"
                    : "text-brand-muted border-brand-border hover:text-white hover:border-brand-gold/30"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Signals Grid */}
      <section className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {signals.map((signal) => (
              <SignalCard key={signal.symbol} signal={signal} />
            ))}
          </div>

          <p className="text-center text-brand-muted text-sm mt-8">
            {user
              ? "Example signals shown. Live signals stream from your TradingView alerts via the Signal Dashboard."
              : "Sign up free to unlock signal details. Live signals available to all members."}
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-brand-card/30 border-y border-brand-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="layer-badge mb-3 inline-block">HOW IT WORKS</span>
            <h2 className="section-title">From Data to Decision</h2>
            <p className="section-subtitle">
              The Signal Engine processes 12 layers of data in real-time and outputs a clear, actionable signal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="w-12 h-12 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-brand-gold font-display font-bold">1</span>
              </div>
              <h3 className="font-display font-bold text-white mb-2">Data Collection</h3>
              <p className="text-brand-muted text-sm leading-relaxed">
                12 layers of market data — order flow, technicals, macro, sentiment, congressional trades,
                and more — are ingested in real-time from multiple API sources.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-brand-gold font-display font-bold">2</span>
              </div>
              <h3 className="font-display font-bold text-white mb-2">Confluence Scoring</h3>
              <p className="text-brand-muted text-sm leading-relaxed">
                Each layer is weighted by its predictive power and combined into a single 0–100 score.
                The more layers that agree, the stronger the signal.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-brand-gold font-display font-bold">3</span>
              </div>
              <h3 className="font-display font-bold text-white mb-2">Clear Output</h3>
              <p className="text-brand-muted text-sm leading-relaxed">
                You get a clear BUY/SELL/WAIT signal with entry price, stop loss, targets, R:R ratio,
                and a plain-English explanation of every contributing factor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signal scale */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="section-title text-center mb-8">Signal Strength Scale</h2>
          <div className="space-y-3">
            {[
              { range: "80–100", label: "Strong BUY",  color: "bg-brand-green", width: "100%" },
              { range: "60–79",  label: "BUY",          color: "bg-yellow-400",  width: "79%"  },
              { range: "40–59",  label: "WAIT",         color: "bg-brand-muted", width: "59%"  },
              { range: "20–39",  label: "SELL",         color: "bg-orange-400",  width: "39%"  },
              { range: "0–19",   label: "Strong SELL",  color: "bg-brand-red",   width: "19%"  },
            ].map((s) => (
              <div key={s.range} className="flex items-center gap-4">
                <span className="text-brand-muted text-sm font-mono w-16 text-right flex-shrink-0">{s.range}</span>
                <div className="flex-1 h-8 bg-brand-border rounded-lg overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-lg flex items-center px-3`}
                    style={{ width: s.width }}
                  >
                    <span className="text-brand-bg text-xs font-bold whitespace-nowrap">{s.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-20 px-4 text-center border-t border-brand-border">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display font-black text-3xl md:text-4xl text-white mb-6">
              Unlock <span className="text-gradient-gold">Live Signals</span>
            </h2>
            <p className="text-brand-muted text-lg mb-8">
              Free membership unlocks all signal details. Paid tiers unlock live signal streams, order flow, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="btn-gold text-base py-4 px-8">
                Sign Up Free →
              </Link>
              <Link href="/pricing" className="btn-outline text-base py-4 px-8">
                See Pricing
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
