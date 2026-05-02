"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "../../components/auth/AuthGuard";

interface Signal {
  symbol: string;
  timeframe: string;
  score: number;
  direction: string;
  entry: number;
  stopLoss: number;
  target1: number;
  target2?: number;
  rrRatio: string;
  timestamp: string;
  pnl?: number;
  status?: "open" | "filled" | "tp1hit" | "closed";
}

function calculateStats(signals: Signal[]) {
  if (signals.length === 0) {
    return {
      winRate: "0%",
      totalTrades: "0",
      avgRR: "1 : 0",
      netPnL: "$0",
      winCount: 0,
    };
  }

  const winCount = signals.filter((s) => s.pnl && s.pnl > 0).length;
  const winRate = signals.length > 0 ? ((winCount / signals.length) * 100).toFixed(1) : "0";

  const rrValues = signals
    .map((s) => {
      const match = s.rrRatio?.match(/1\s*:\s*([\d.]+)/);
      return match ? parseFloat(match[1]) : 0;
    })
    .filter((v) => v > 0);
  const avgRR = rrValues.length > 0 ? (rrValues.reduce((a, b) => a + b, 0) / rrValues.length).toFixed(1) : "0";

  const totalPnL = signals.reduce((sum, s) => sum + (s.pnl || 0), 0);
  const pnlStr = totalPnL >= 0 ? `+$${Math.abs(totalPnL).toFixed(0)}` : `-$${Math.abs(totalPnL).toFixed(0)}`;

  return {
    winRate: `${winRate}%`,
    totalTrades: signals.length.toString(),
    avgRR: `1 : ${avgRR}`,
    netPnL: pnlStr,
    winCount,
  };
}

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
    return "—";
  }
}

const STRATEGIES = [
  {
    name: "MES Pullback Scalper v8",
    desc: "EMA21 pullback + ADX > 18 + RSI filter. TP 1.0×ATR / SL 1.2×ATR. Target: 58–65% WR, PF > 1.3.",
    status: "active",
    symbols: ["MES1!"],
    tf: "15m",
  },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    open:   { label: "OPEN",    cls: "text-brand-green  bg-brand-green/10  border-brand-green/30"  },
    filled: { label: "FILLED",  cls: "text-brand-gold   bg-brand-gold/10   border-brand-gold/30"   },
    tp1hit: { label: "TP1 HIT", cls: "text-brand-green  bg-brand-green/10  border-brand-green/30"  },
    closed: { label: "CLOSED",  cls: "text-brand-muted  bg-white/5         border-brand-border"    },
  };
  const { label, cls } = map[status] ?? map.closed;
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cls}`}>{label}</span>
  );
}

function BotPageInner() {
  const [botRunning, setBotRunning] = useState(false);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        setLoading(true);
        const workerUrl = process.env.NEXT_PUBLIC_SIGNAL_WORKER_URL || "https://oristrade-signals.bergstromfinancials.workers.dev";
        const response = await fetch(`${workerUrl}/signals`);

        if (!response.ok) {
          throw new Error(`Worker returned ${response.status}`);
        }

        const data = await response.json();
        setSignals(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch signals";
        setError(message);
        setSignals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();
    const interval = setInterval(fetchSignals, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const stats = calculateStats(signals);
  const recentSignals = signals.slice(0, 10); // Show last 10 signals

  const botStats = [
    { label: "Win Rate", value: stats.winRate, delta: `${stats.winCount}/${signals.length} wins`, positive: true },
    { label: "Total Trades", value: stats.totalTrades, delta: "all time", positive: null },
    { label: "Avg R:R", value: stats.avgRR, delta: "30-day avg", positive: null },
    { label: "Net P&L", value: stats.netPnL, delta: "all time", positive: stats.netPnL.includes("+") },
  ];

  return (
    <div className="min-h-screen bg-brand-bg p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            <span className="text-gradient-gold">Oristrade</span> Bot
          </h1>
          <p className="text-brand-muted text-sm mt-0.5">
            MES Pullback Scalper v8 — EMA21 pullback scalp on 15m candles
          </p>
        </div>

        {/* Run/Pause toggle */}
        <button
          onClick={() => setBotRunning((r) => !r)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all border ${
            botRunning
              ? "bg-brand-red/10 text-brand-red border-brand-red/30 hover:bg-brand-red/20"
              : "bg-brand-green/10 text-brand-green border-brand-green/30 hover:bg-brand-green/20"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${botRunning ? "bg-brand-red animate-pulse" : "bg-brand-green"}`} />
          {botRunning ? "Pause Bot" : "Start Bot"}
        </button>
      </div>

      {/* Coming-soon banner */}
      <div className="mb-6 rounded-xl border border-brand-gold/20 bg-brand-gold/5 px-4 py-3 flex items-start gap-3">
        <span className="text-brand-gold text-lg flex-shrink-0">⚡</span>
        <div>
          <p className="text-brand-gold text-sm font-semibold">Phase 3 Preview</p>
          <p className="text-brand-muted text-xs mt-0.5">
            Live execution is in development. All signals and stats below are illustrative.
            Connect a broker in Settings to enable live trading.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {botStats.map((s) => (
          <div key={s.label} className="bg-brand-card border border-brand-border rounded-xl p-4">
            <p className="text-brand-muted text-xs mb-1">{s.label}</p>
            <p className="text-white font-bold text-xl font-display">{loading ? "—" : s.value}</p>
            <p className={`text-xs mt-0.5 ${s.positive === true ? "text-brand-green" : s.positive === false ? "text-brand-red" : "text-brand-muted"}`}>
              {loading ? "Loading..." : s.delta}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent signals */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-xl p-4">
          <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <span>🎯</span> Recent Signals
          </h2>
          {loading ? (
            <div className="text-center py-8 text-brand-muted">Loading signals...</div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-brand-red text-sm mb-2">Error: {error}</p>
              <p className="text-brand-muted text-xs">Check that the Cloudflare Worker is running and returning data from /signals</p>
            </div>
          ) : recentSignals.length === 0 ? (
            <div className="text-center py-8 text-brand-muted text-sm">No signals yet. Set up TradingView webhook alerts to the Worker.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-brand-muted border-b border-brand-border">
                    <th className="text-left pb-2 font-medium">Symbol</th>
                    <th className="text-left pb-2 font-medium">Dir</th>
                    <th className="text-right pb-2 font-medium">Entry</th>
                    <th className="text-right pb-2 font-medium">SL</th>
                    <th className="text-right pb-2 font-medium">TP</th>
                    <th className="text-right pb-2 font-medium">Score</th>
                    <th className="text-right pb-2 font-medium">Time</th>
                    <th className="text-right pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSignals.map((sig, i) => (
                    <tr key={i} className="border-b border-brand-border/50 hover:bg-white/2 transition-colors">
                      <td className="py-2 font-bold text-white">{sig.symbol}</td>
                      <td className={`py-2 font-bold ${sig.direction === "LONG" || sig.direction.toUpperCase() === "STRONG_BUY" || sig.direction.toUpperCase() === "BUY" ? "text-brand-green" : "text-brand-red"}`}>
                        {sig.direction === "LONG" || sig.direction.toUpperCase() === "STRONG_BUY" || sig.direction.toUpperCase() === "BUY" ? "▲" : "▼"} {sig.direction}
                      </td>
                      <td className="py-2 text-right text-white">{sig.entry.toFixed(2)}</td>
                      <td className="py-2 text-right text-brand-red">{sig.stopLoss.toFixed(2)}</td>
                      <td className="py-2 text-right text-brand-green">{sig.target1.toFixed(2)}</td>
                      <td className="py-2 text-right">
                        <span className={`font-bold ${sig.score >= 80 ? "text-brand-gold" : "text-brand-muted"}`}>
                          {sig.score}
                        </span>
                      </td>
                      <td className="py-2 text-right text-brand-muted">{formatTime(sig.timestamp)}</td>
                      <td className="py-2 text-right">
                        <StatusBadge status={sig.status || "open"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active strategies */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-4">
          <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <span>⚙️</span> Strategies
          </h2>
          <div className="space-y-3">
            {STRATEGIES.map((strat) => (
              <div key={strat.name} className="border border-brand-border rounded-lg p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-white text-xs font-semibold">{strat.name}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${
                    strat.status === "active"
                      ? "text-brand-green bg-brand-green/10 border-brand-green/30"
                      : "text-brand-muted bg-white/5 border-brand-border"
                  }`}>
                    {strat.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-brand-muted text-[11px] mb-2">{strat.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {strat.symbols.map((sym) => (
                    <span key={sym} className="text-[10px] text-brand-muted border border-brand-border rounded px-1.5 py-0.5">
                      {sym}
                    </span>
                  ))}
                  <span className="text-[10px] text-brand-gold border border-brand-gold/20 bg-brand-gold/5 rounded px-1.5 py-0.5">
                    {strat.tf}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BotPage() {
  return (
    <AuthGuard requiredTier="starter">
      <BotPageInner />
    </AuthGuard>
  );
}
