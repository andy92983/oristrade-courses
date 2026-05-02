"use client";

import { useState, useEffect, useCallback } from "react";
import type { SymbolDef } from "./SymbolSelector";

const WORKER_URL = process.env.NEXT_PUBLIC_SIGNAL_WORKER_URL || "https://oristrade-signals.bergstromfinancials.workers.dev";

interface DeltaProSignal {
  symbol: string;
  signal: "BUY" | "SELL" | "WAIT";
  buyScore: number;
  sellScore: number;
  strength: number;
  price: number;
  delta: number;
  atr: number;
  scores_buy: number[];
  scores_sell: number[];
  mtf_1: string;
  mtf_5: string;
  mtf_15: string;
  tf: string;
  receivedAt: string;
}

const COMPONENT_NAMES = [
  "VWAP",
  "Delta %",
  "Stochastic",
  "BOS",
  "EMA 50/200",
  "ADX",
  "Session",
  "RSI Div",
  "Liq Sweep",
  "Order Block",
  "FVG",
  "MACD Hist",
  "Candle",
  "HTF Bias",
];

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function DeltaConfluenceProPanel({ symbol }: { symbol: SymbolDef }) {
  const [data, setData] = useState<DeltaProSignal | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchSignal = useCallback(async () => {
    if (!WORKER_URL) return;
    setLoading(true);
    try {
      const res = await fetch(`${WORKER_URL}/signal?symbol=${symbol.key}`);
      const json = await res.json();
      setData(json.signal !== null ? json : null);
      setLastFetch(new Date());
    } catch {
      // network error — keep previous data
    } finally {
      setLoading(false);
    }
  }, [symbol.key]);

  // Fetch on mount and when symbol changes
  useEffect(() => {
    setData(null);
    fetchSignal();
  }, [symbol.key, fetchSignal]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const id = setInterval(fetchSignal, 60_000);
    return () => clearInterval(id);
  }, [fetchSignal]);

  const sig = data?.signal ?? null;
  const sigColor = sig === "BUY" ? "text-brand-green" : sig === "SELL" ? "text-brand-red" : "text-yellow-400";
  const sigBg = sig === "BUY" ? "bg-brand-green/10 border-brand-green/20" : sig === "SELL" ? "bg-brand-red/10 border-brand-red/20" : "bg-yellow-500/10 border-yellow-500/20";

  const buyCount = data?.scores_buy?.filter((s) => s === 1).length || 0;
  const sellCount = data?.scores_sell?.filter((s) => s === 1).length || 0;

  if (!WORKER_URL) {
    return (
      <div className="card text-center py-10">
        <div className="text-4xl mb-3">🔗</div>
        <p className="text-brand-muted text-sm">
          Worker URL not set. Add <code className="text-brand-gold">NEXT_PUBLIC_SIGNAL_WORKER_URL</code> to your env vars.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-brand-gold rounded-full animate-pulse" />
          <span className="text-brand-gold text-xs font-bold tracking-wide">DELTA CONFLUENCE PRO V2</span>
        </div>
        <div className="flex items-center gap-3">
          {lastFetch && (
            <span className="text-brand-muted text-xs">Updated {timeAgo(lastFetch.toISOString())}</span>
          )}
          <button
            onClick={fetchSignal}
            disabled={loading}
            className="text-brand-muted hover:text-white text-xs border border-brand-border rounded px-2 py-1 transition-colors"
          >
            {loading ? "…" : "↻ Refresh"}
          </button>
        </div>
      </div>

      {!data ? (
        /* Waiting state */
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">📡</div>
          <h3 className="text-white font-bold text-lg mb-2">Waiting for Signal — {symbol.label}</h3>
          <p className="text-brand-muted text-sm max-w-sm mx-auto">
            No alert received yet. In TradingView, open your chart for <strong className="text-white">{symbol.key}</strong>,
            apply the <em>Delta Confluence Pro V2</em> indicator, then create an alert using the
            "BUY V2 (OrisTrade)" or "SELL V2 (OrisTrade)" condition with your Worker webhook URL.
          </p>
          <div className="mt-4 text-xs text-brand-muted/60">
            Signals expire after 24 hours · Auto-refreshes every 60s
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ── Left: Signal Card ── */}
          <div className="space-y-4">
            {/* Main signal card */}
            <div className={`card border ${sigBg}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-brand-muted text-xs font-semibold">DELTA PRO V2 SIGNAL · {data.tf}</span>
                <span className="text-brand-muted text-xs">{timeAgo(data.receivedAt)}</span>
              </div>
              <div className={`font-display font-black text-4xl ${sigColor} mb-1`}>{sig}</div>
              <div className="text-white font-bold text-lg mb-3">{sig === "BUY" ? data.buyScore : data.sellScore}/14 components</div>

              {/* Score bar */}
              <div className="h-2 bg-brand-border rounded-full mb-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    sig === "BUY" ? "bg-brand-green" : sig === "SELL" ? "bg-brand-red" : "bg-yellow-500"
                  }`}
                  style={{ width: `${((sig === "BUY" ? data.buyScore : data.sellScore) / 14) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-brand-muted">
                <span>0</span><span>7</span><span>14</span>
              </div>

              {/* Metrics */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Price</span>
                  <span className="text-white font-mono font-bold">${data.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Delta</span>
                  <span className={`font-mono font-bold ${data.delta > 0 ? "text-brand-green" : "text-brand-red"}`}>
                    {data.delta > 0 ? "+" : ""}{data.delta}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">ATR</span>
                  <span className="text-white font-mono font-bold">${data.atr.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-brand-border">
                  <span className="text-brand-muted">Strength</span>
                  <span className="text-white font-bold">{data.strength}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Middle: 14-Component Breakdown Table ── */}
          <div className="card">
            <div className="text-brand-muted text-xs font-semibold mb-4">14-COMPONENT BREAKDOWN</div>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {COMPONENT_NAMES.map((name, idx) => {
                const buyActive = data.scores_buy[idx] === 1;
                const sellActive = data.scores_sell[idx] === 1;
                return (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-brand-card/50 transition-colors">
                    <span className={`flex-1 ${buyActive || sellActive ? "text-white" : "text-brand-muted"}`}>{name}</span>
                    <div className="flex gap-2 ml-2">
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center font-bold ${
                          buyActive ? "bg-brand-green/20 text-brand-green" : "bg-brand-border text-brand-muted"
                        }`}
                      >
                        {buyActive ? "✓" : "–"}
                      </span>
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center font-bold ${
                          sellActive ? "bg-brand-red/20 text-brand-red" : "bg-brand-border text-brand-muted"
                        }`}
                      >
                        {sellActive ? "✓" : "–"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-brand-border text-center">
              <span className="text-xs text-brand-muted">
                {buyCount + sellCount} of 14 active
              </span>
            </div>
          </div>

          {/* ── Right: Multi-Timeframe + Interpretation ── */}
          <div className="space-y-4">
            {/* Multi-Timeframe Confluence */}
            <div className="card">
              <div className="text-brand-muted text-xs font-semibold mb-4">MULTI-TIMEFRAME CONFLUENCE</div>
              <div className="space-y-2">
                <div className={`p-3 rounded-lg border ${data.mtf_1 === "BUY" ? "bg-brand-green/10 border-brand-green/30" : data.mtf_1 === "SELL" ? "bg-brand-red/10 border-brand-red/30" : "bg-brand-card border-brand-border"}`}>
                  <div className="text-xs text-brand-muted mb-1">1-minute</div>
                  <div className={`font-bold text-sm ${data.mtf_1 === "BUY" ? "text-brand-green" : data.mtf_1 === "SELL" ? "text-brand-red" : "text-brand-muted"}`}>
                    {data.mtf_1}
                  </div>
                </div>
                <div className={`p-3 rounded-lg border ${data.mtf_5 === "BUY" ? "bg-brand-green/10 border-brand-green/30" : data.mtf_5 === "SELL" ? "bg-brand-red/10 border-brand-red/30" : "bg-brand-card border-brand-border"}`}>
                  <div className="text-xs text-brand-muted mb-1">5-minute</div>
                  <div className={`font-bold text-sm ${data.mtf_5 === "BUY" ? "text-brand-green" : data.mtf_5 === "SELL" ? "text-brand-red" : "text-brand-muted"}`}>
                    {data.mtf_5}
                  </div>
                </div>
                <div className={`p-3 rounded-lg border ${data.mtf_15 === "BUY" ? "bg-brand-green/10 border-brand-green/30" : data.mtf_15 === "SELL" ? "bg-brand-red/10 border-brand-red/30" : "bg-brand-card border-brand-border"}`}>
                  <div className="text-xs text-brand-muted mb-1">15-minute</div>
                  <div className={`font-bold text-sm ${data.mtf_15 === "BUY" ? "text-brand-green" : data.mtf_15 === "SELL" ? "text-brand-red" : "text-brand-muted"}`}>
                    {data.mtf_15}
                  </div>
                </div>
              </div>
            </div>

            {/* Signal Interpretation */}
            <div className="card">
              <div className="text-brand-muted text-xs font-semibold mb-3">SIGNAL STRENGTH</div>
              <div className="space-y-2 text-xs text-brand-muted leading-relaxed">
                {sig === "BUY" && data.buyScore >= 10 && (
                  <p className="text-brand-green">⚡ Strong buy ({data.buyScore}/14). High confluence.</p>
                )}
                {sig === "BUY" && data.buyScore >= 4 && data.buyScore < 10 && (
                  <p className="text-yellow-400">📊 Valid buy ({data.buyScore}/14). Manage risk carefully.</p>
                )}
                {sig === "SELL" && data.sellScore >= 10 && (
                  <p className="text-brand-red">⚡ Strong sell ({data.sellScore}/14). High confluence.</p>
                )}
                {sig === "SELL" && data.sellScore >= 4 && data.sellScore < 10 && (
                  <p className="text-yellow-400">📊 Valid sell ({data.sellScore}/14). Manage risk carefully.</p>
                )}
                {sig === "WAIT" && (
                  <p className="text-brand-muted">⏸️ Buy: {buyCount}/14 · Sell: {sellCount}/14. Awaiting confluence.</p>
                )}
                <p className="text-brand-muted/70 text-xs mt-2">
                  Threshold: ≥4/14 components required for alert
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
