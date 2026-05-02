"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import Link from "next/link";
import { AuthGuard } from "../../components/auth/AuthGuard";
import { LayerStatus } from "../../components/dashboard/LayerStatus";
import { MacroPanel } from "../../components/dashboard/MacroPanel";
import { SentimentPanel } from "../../components/dashboard/SentimentPanel";
import { TechAnalysisWidget } from "../../components/dashboard/TechAnalysisWidget";
import { CombinedSignal } from "../../components/dashboard/CombinedSignal";
import { SymbolSelector, ALL_SYMBOLS, type SymbolDef } from "../../components/dashboard/SymbolSelector";
import { TickerTape } from "../../components/tradingview/tickertape";
import { getMacroSnapshot, scoreMacro } from "../../lib/api/macro-client";
import { getSentimentSnapshot } from "../../lib/api/sentiment-client";

const DeltaConfluencePanel = lazy(() => import("../../components/dashboard/DeltaConfluencePanel").then(m => ({ default: m.DeltaConfluencePanel })));
const DeltaConfluenceProPanel = lazy(() => import("../../components/dashboard/DeltaConfluenceProPanel").then(m => ({ default: m.DeltaConfluenceProPanel })));

const WORKER_URL = process.env.NEXT_PUBLIC_SIGNAL_WORKER_URL || "https://oristrade-signals.bergstromfinancials.workers.dev";

// Default to SPY on load
const DEFAULT_SYMBOL = ALL_SYMBOLS.find((s) => s.key === "SPY")!;

export default function DashboardPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolDef>(DEFAULT_SYMBOL);
  const [allSignals, setAllSignals]         = useState<Record<string, { signal: string }>>({});
  const [macroScore, setMacroScore]         = useState<number | undefined>(undefined);
  const [sentimentScore, setSentimentScore] = useState<number | undefined>(undefined);

  // Fetch all signals for dot indicators in symbol selector
  useEffect(() => {
    if (!WORKER_URL) return;
    const fetchAll = async () => {
      try {
        const res = await fetch(`${WORKER_URL}/signals`);
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        setAllSignals(data);
      } catch {
        // Worker unavailable — keep previous signals or empty
        setAllSignals({});
      }
    };
    fetchAll();
    const id = setInterval(fetchAll, 60_000);
    return () => clearInterval(id);
  }, []);

  // Fetch macro + sentiment scores for combined scoring
  useEffect(() => {
    getMacroSnapshot()
      .then((snap) => setMacroScore(scoreMacro(snap).score))
      .catch(() => setMacroScore(50)); // fallback to neutral

    getSentimentSnapshot()
      .then((snap) => setSentimentScore(snap.score))
      .catch(() => setSentimentScore(50)); // fallback to neutral
  }, []);

  return (
    <AuthGuard>
    <div className="min-h-screen bg-brand-bg">

      {/* Ticker tape */}
      <div className="pt-16">
        <TickerTape />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
              <span className="text-brand-green text-xs font-bold tracking-wide">LIVE DASHBOARD</span>
            </div>
            <h1 className="font-display font-black text-2xl md:text-3xl text-white">
              Signal Dashboard
            </h1>
            <p className="text-brand-muted text-sm mt-1">
              OrisTrade Master Confluence V4 · Sentiment — Layers 3, 4 active
            </p>
          </div>
          <Link href="/pricing" className="btn-gold text-sm py-2 px-4 self-start sm:self-auto">
            Unlock All 12 Layers →
          </Link>
        </div>

        {/* ── Symbol Selector + Signal Panel ── */}
        <div className="card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
              <span className="text-brand-gold text-xs font-bold">⚡</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-lg leading-tight">Live Signal — {selectedSymbol.label}</h2>
              <p className="text-brand-muted text-xs">OrisTrade Master Confluence V3 · Select any instrument below</p>
            </div>
          </div>

          {/* Symbol Selector */}
          <div className="mb-6 pb-6 border-b border-brand-border">
            <SymbolSelector
              selected={selectedSymbol}
              onSelect={setSelectedSymbol}
              signals={allSignals}
            />
          </div>

          {/* OrisTrade Master Confluence V4 Signal Panel */}
          <Suspense fallback={<div className="card text-center py-6 text-brand-muted">Loading signal data…</div>}>
            <DeltaConfluencePanel
              symbol={selectedSymbol}
              macroScore={macroScore}
              sentimentScore={sentimentScore}
            />
          </Suspense>
        </div>

        {/* Delta Confluence Pro V2 Signal Panel */}
        <div className="card">
          <Suspense fallback={<div className="text-center py-6 text-brand-muted">Loading advanced signals…</div>}>
            <DeltaConfluenceProPanel symbol={selectedSymbol} />
          </Suspense>
        </div>

        {/* ── Technical Analysis (TradingView) — synced to selected symbol ── */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
                <span className="text-brand-gold text-xs font-bold">2</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-lg leading-tight">Technical Analysis</h3>
                <p className="text-brand-muted text-xs">TradingView ratings for {selectedSymbol.label}</p>
              </div>
            </div>
            <span className="bg-brand-green/10 text-brand-green text-xs font-bold px-2 py-0.5 rounded-full border border-brand-green/20">
              LIVE
            </span>
          </div>
          <TechAnalysisWidget symbol={selectedSymbol.tvSymbol} label={selectedSymbol.label} />
        </div>

        {/* ── Macro + Combined Signal ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CombinedSignal />
          </div>
          <div className="lg:col-span-2">
            <MacroPanel />
          </div>
        </div>

        {/* ── Sentiment ── */}
        <SentimentPanel />

        {/* ── Layer Status ── */}
        <div>
          <h2 className="font-display font-bold text-white text-xl mb-4">Signal Layer Status</h2>
          <LayerStatus />
        </div>

        {/* ── Phase 2 CTA ── */}
        <div className="card border-brand-gold/30 text-center py-10">
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="font-display font-bold text-white text-2xl mb-2">Phase 2 Coming Soon</h2>
          <p className="text-brand-muted text-sm max-w-xl mx-auto mb-6">
            Polygon.io order flow, dark pool prints, options sweeps (Layer 1),
            congressional data (Layer 5), intermarket analysis (Layer 6),
            and full options analytics (Layer 9) unlock next.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pricing" className="btn-gold">See Membership Plans →</Link>
            <Link href="/education" className="btn-outline">Learn How Layers Work</Link>
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <div className="bg-brand-card/50 border border-brand-border rounded-xl px-5 py-4">
          <p className="text-brand-muted text-xs leading-relaxed">
            <strong className="text-brand-muted">⚠️ Educational Disclaimer:</strong> All data, signals, and analysis
            displayed on the OrisTrade dashboard are for educational and informational purposes only.
            Nothing here constitutes financial advice, investment advice, or a recommendation to buy or sell
            any security. Trading involves significant risk of loss. Past performance does not guarantee future results.
            OrisTrade is not a registered investment advisor. Always do your own research.
          </p>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
