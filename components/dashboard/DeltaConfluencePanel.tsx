"use client";

import { useEffect, useState, useCallback } from "react";
import type { SymbolDef } from "./SymbolSelector";

// ── Types ──────────────────────────────────────────────────────────────────
interface SignalData {
  symbol: string;
  exchange?: string;
  tf: string;
  signal: "BUY" | "SELL" | "WAIT";
  buyScore: number;
  sellScore: number;
  strength: number;
  price: number;
  sl: number;
  tp: number;
  atr: number;
  delta: number;
  scores_buy: number[];   // length 6
  scores_sell: number[];  // length 6
  adx: number;
  rsi: number;
  fan_momentum: number;
  smc_status: string;
  receivedAt: string;
}

// 6 core components from OrisTrade Master Confluence v4
const COMPONENTS = [
  { label: "Supertrend",      layer: "L2" },
  { label: "ADX + DMI Trend", layer: "L2" },
  { label: "EMA Ribbon (8-55)", layer: "L2" },
  { label: "Volume Flux (FVVO)", layer: "L3" },
  { label: "RSI Filter",      layer: "L2" },
  { label: "HTF Bias",        layer: "L2" },
];

const WORKER_URL = process.env.NEXT_PUBLIC_SIGNAL_WORKER_URL || "https://oristrade-signals.bergstromfinancials.workers.dev";

// ── Helpers ────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function rr(price: number, sl: number, tp: number) {
  const risk   = Math.abs(price - sl);
  const reward = Math.abs(tp - price);
  if (risk === 0) return "—";
  return `1:${(reward / risk).toFixed(1)}`;
}

function MtfBadge({ label, value }: { label: string; value: string }) {
  const color =
    value === "BUY"  ? "text-brand-green bg-brand-green/10 border-brand-green/20" :
    value === "SELL" ? "text-brand-red   bg-brand-red/10   border-brand-red/20" :
                       "text-brand-muted bg-brand-card      border-brand-border";
  return (
    <div className={`text-center rounded-lg border px-3 py-2 ${color}`}>
      <div className="text-xs font-bold">{label}</div>
      <div className="text-xs mt-0.5 font-semibold">{value}</div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export function DeltaConfluencePanel({
  symbol,
  macroScore,
  sentimentScore,
}: {
  symbol: SymbolDef;
  macroScore?: number;
  sentimentScore?: number;
}) {
  const [data, setData]       = useState<SignalData | null>(null);
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

  // ── Combined OrisTrade Score ─────────────────────────────────────────────
  // Weights: Delta Confluence 60% | Macro 25% | Sentiment 15%
  const deltaStrength = data?.strength ?? 0;
  const macro         = macroScore     ?? 50;
  const sentiment     = sentimentScore ?? 50;
  const combinedScore = Math.round(deltaStrength * 0.6 + macro * 0.25 + sentiment * 0.15);
  const combinedDir   =
    combinedScore >= 65 ? "STRONG BUY"  :
    combinedScore >= 55 ? "WEAK BUY"    :
    combinedScore <= 35 ? "STRONG SELL" :
    combinedScore <= 45 ? "WEAK SELL"   : "WAIT";
  const combinedColor =
    combinedScore >= 55 ? "text-brand-green" :
    combinedScore <= 45 ? "text-brand-red"   : "text-yellow-400";

  // ── No signal state ──────────────────────────────────────────────────────
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

  // ── Signal Card ──────────────────────────────────────────────────────────
  const sig         = data?.signal ?? null;
  const score       = sig === "BUY" ? (data?.buyScore ?? 0) : (data?.sellScore ?? 0);
  const scores      = sig === "BUY" ? (data?.scores_buy ?? []) : (data?.scores_sell ?? []);
  const sigColor    = sig === "BUY" ? "text-brand-green" : sig === "SELL" ? "text-brand-red" : "text-yellow-400";
  const sigBg       = sig === "BUY" ? "bg-brand-green/10 border-brand-green/20" : sig === "SELL" ? "bg-brand-red/10 border-brand-red/20" : "bg-yellow-500/10 border-yellow-500/20";

  return (
    <div className="space-y-4">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
          <span className="text-brand-green text-xs font-bold tracking-wide">ORISTRADE MASTER CONFLUENCE V4</span>
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
            apply the <em>OrisTrade Master Confluence v4</em> indicator, then create an alert using the
            "BUY" or "SELL" condition with your Worker webhook URL.
          </p>
          <div className="mt-4 text-xs text-brand-muted/60">
            Signals expire after 24 hours · Auto-refreshes every 60s
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ── Left: Signal + Combined Score ── */}
          <div className="space-y-4">

            {/* Raw signal card */}
            <div className={`card border ${sigBg}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-brand-muted text-xs font-semibold">OT·MC V4 SIGNAL · {data.tf}m</span>
                <span className="text-brand-muted text-xs">{timeAgo(data.receivedAt)}</span>
              </div>
              <div className={`font-display font-black text-4xl ${sigColor} mb-1`}>{sig}</div>
              <div className="text-white font-bold text-lg mb-3">{score}/6 components</div>

              {/* Score bar */}
              <div className="h-2 bg-brand-border rounded-full mb-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    sig === "BUY" ? "bg-brand-green" : sig === "SELL" ? "bg-brand-red" : "bg-yellow-500"
                  }`}
                  style={{ width: `${(score / 6) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-brand-muted">
                <span>0</span><span>3</span><span>6</span>
              </div>

              {/* Price levels */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Entry</span>
                  <span className="text-white font-mono font-bold">{data.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-red">Stop Loss</span>
                  <span className="text-brand-red font-mono font-bold">{data.sl.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-green">Take Profit</span>
                  <span className="text-brand-green font-mono font-bold">{data.tp.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-brand-border">
                  <span className="text-brand-muted">R:R Ratio</span>
                  <span className="text-brand-gold font-bold">{rr(data.price, data.sl, data.tp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Delta %</span>
                  <span className={`font-mono font-bold ${data.delta > 0 ? "text-brand-green" : "text-brand-red"}`}>
                    {data.delta > 0 ? "+" : ""}{data.delta}%
                  </span>
                </div>
              </div>
            </div>

            {/* Combined OrisTrade Score */}
            <div className="card">
              <div className="text-brand-muted text-xs font-semibold mb-3">ORISTRADE COMBINED SCORE</div>
              <div className={`font-display font-black text-5xl ${combinedColor} mb-1`}>{combinedScore}</div>
              <div className={`font-bold text-sm mb-3 ${combinedColor}`}>{combinedDir}</div>
              <div className="h-2 bg-brand-border rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    combinedScore >= 55 ? "bg-brand-green" : combinedScore <= 45 ? "bg-brand-red" : "bg-yellow-500"
                  }`}
                  style={{ width: `${combinedScore}%` }}
                />
              </div>
              <div className="text-xs text-brand-muted space-y-1">
                <div className="flex justify-between">
                  <span>Delta Confluence (60%)</span>
                  <span className="text-white">{deltaStrength}</span>
                </div>
                <div className="flex justify-between">
                  <span>Macro / FRED (25%)</span>
                  <span className="text-white">{macro}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sentiment (15%)</span>
                  <span className="text-white">{sentiment}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Middle: 6-Component Breakdown ── */}
          <div className="card">
            <div className="text-brand-muted text-xs font-semibold mb-4">6-COMPONENT CONFLUENCE</div>
            <div className="space-y-2">
              {COMPONENTS.map((c, i) => {
                const fired = scores[i] === 1;
                return (
                  <div key={c.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          fired
                            ? sig === "BUY" ? "bg-brand-green/20 text-brand-green" : "bg-brand-red/20 text-brand-red"
                            : "bg-brand-border text-brand-muted"
                        }`}
                      >
                        {fired ? "✓" : "–"}
                      </span>
                      <span className={`text-sm ${fired ? "text-white" : "text-brand-muted"}`}>{c.label}</span>
                    </div>
                    <span className="text-xs text-brand-muted/60 font-mono">{c.layer}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-brand-border text-center">
              <span className="text-xs text-brand-muted">
                {scores.filter(s => s === 1).length} of 6 confirmed
              </span>
            </div>
          </div>

          {/* ── Right: Multi-Timeframe + TradingView ── */}
          <div className="space-y-4">

            {/* OT·MC V3 Metrics */}
            <div className="card">
              <div className="text-brand-muted text-xs font-semibold mb-4">OT·MC V3 METRICS</div>
              <div className="space-y-3">
                {data.adx && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-brand-muted">ADX Strength</span>
                      <span className="text-white font-bold">{data.adx.toFixed(1)}</span>
                    </div>
                    <div className="h-2 bg-brand-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-aqua transition-all duration-500"
                        style={{ width: `${Math.min(data.adx / 50 * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                {data.rsi && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-brand-muted">RSI Value</span>
                      <span className={`font-bold ${data.rsi > 65 ? "text-brand-red" : data.rsi < 35 ? "text-brand-green" : "text-white"}`}>
                        {data.rsi.toFixed(1)}
                      </span>
                    </div>
                    <div className="h-2 bg-brand-border rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          data.rsi > 65 ? "bg-brand-red" : data.rsi < 35 ? "bg-brand-green" : "bg-yellow-400"
                        }`}
                        style={{ width: `${data.rsi}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-brand-muted mt-3 text-center">
                OT·MC v3 integrates HTF dynamics automatically
              </p>
            </div>

            {/* Signal interpretation */}
            <div className="card">
              <div className="text-brand-muted text-xs font-semibold mb-3">READING THIS SIGNAL</div>
              <div className="space-y-2 text-xs text-brand-muted leading-relaxed">
                {score >= 5 && (
                  <p className="text-brand-green">⚡ High confluence ({score}/6). Strong multi-system agreement.</p>
                )}
                {score === 4 && (
                  <p className="text-yellow-400">📊 Moderate confluence ({score}/6). Valid setup, manage risk carefully.</p>
                )}
                {score < 4 && (
                  <p className="text-brand-muted">⚠️ Low confluence ({score}/6). Wait for a stronger setup.</p>
                )}
                {data.adx && data.adx > 25 && (
                  <p className="text-brand-green">✅ ADX {data.adx.toFixed(1)} — strong trending condition.</p>
                )}
                {data.fan_momentum && data.fan_momentum > 70 && (
                  <p className="text-brand-green">✅ Fan momentum {data.fan_momentum.toFixed(0)}% — high expansion.</p>
                )}
                {data.smc_status && (data.smc_status === "BULL SHIFT" || data.smc_status === "BEAR SHIFT") && (
                  <p className={data.smc_status === "BULL SHIFT" ? "text-brand-green" : "text-brand-red"}>✅ {data.smc_status} detected via CHoCH/BOS.</p>
                )}
              </div>
            </div>

            {/* ATR info */}
            <div className="card text-sm">
              <div className="text-brand-muted text-xs font-semibold mb-2">ATR (VOLATILITY)</div>
              <div className="font-mono text-white font-bold text-lg">{data.atr.toFixed(2)}</div>
              <p className="text-xs text-brand-muted mt-1">
                Average True Range — used for SL/TP sizing. 1×ATR stop, 2×ATR target.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
