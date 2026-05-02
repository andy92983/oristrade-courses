"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AuthGuard } from "../../components/auth/AuthGuard";

// ─── Types ────────────────────────────────────────────────────────────────────
interface OptionsContract {
  ticker: string;
  underlying_ticker: string;
  expiration_date: string;
  strike_price: number;
  contract_type: "call" | "put";
  day: {
    volume: number;
    open_interest: number;
    last_price: number;
    vwap: number;
    open: number;
    high: number;
    low: number;
    change_percent: number;
  };
  greeks?: { delta: number; gamma: number; theta: number; vega: number; implied_volatility: number } | null;
  implied_volatility?: number | null;
  open_interest?: number | null;
  side: "ask" | "bid" | "neutral";
  sentiment: "bullish" | "bearish" | "neutral";
  premium_estimate: number;
}

interface FlowResponse {
  tickers: string[];
  contracts: OptionsContract[];
  total: number;
  fetched_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const WORKER_URL     = "https://oristrade-signals.bergstromfinancials.workers.dev";
const ALL_TICKERS    = ["SPY", "QQQ", "AAPL", "TSLA", "NVDA", "AMZN", "MSFT", "META", "GOOGL", "AMD"];
const PREMIUM_LEVELS = [
  { label: "All",    min: 0 },
  { label: "$100K+", min: 100_000 },
  { label: "$500K+", min: 500_000 },
  { label: "$1M+",   min: 1_000_000 },
  { label: "$5M+",   min: 5_000_000 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtPremium(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtDate(s: string): string {
  // "2026-04-17" → "Apr 17"
  try { return new Date(s + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
  catch { return s; }
}

function isUnusual(c: OptionsContract): boolean {
  const vol = c.day?.volume ?? 0;
  const oi  = c.day?.open_interest ?? c.open_interest ?? 1;
  return vol > 500 || (oi > 0 && vol / oi > 0.5);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SideBadge({ side }: { side: string }) {
  if (side === "ask") return (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-green/10 text-brand-green border border-brand-green/20 whitespace-nowrap">
      ASK SIDE
    </span>
  );
  if (side === "bid") return (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-red/10 text-brand-red border border-brand-red/20 whitespace-nowrap">
      BID SIDE
    </span>
  );
  return <span className="text-[10px] text-brand-muted">NEUTRAL</span>;
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  if (sentiment === "bullish") return (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-green/10 text-brand-green border border-brand-green/20">
      🟢 BULL
    </span>
  );
  if (sentiment === "bearish") return (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-red/10 text-brand-red border border-brand-red/20">
      🔴 BEAR
    </span>
  );
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────
function OptionsFlowContent() {
  const [data, setData]                     = useState<FlowResponse | null>(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [needsSubscription, setNeedsSubscription] = useState(false);

  // Filters
  const [activeTickers, setActiveTickers]   = useState<Set<string>>(new Set(ALL_TICKERS));
  const [typeFilter, setTypeFilter]         = useState<"all" | "call" | "put">("all");
  const [sideFilter, setSideFilter]         = useState<"all" | "ask" | "bid">("all");
  const [sentimentFilter, setSentimentFilter] = useState<"all" | "bullish" | "bearish">("all");
  const [premiumMin, setPremiumMin]         = useState(0);
  const [unusualOnly, setUnusualOnly]       = useState(false);
  const [sortBy, setSortBy]                 = useState<"premium" | "volume" | "oi">("premium");
  const [customTicker, setCustomTicker]     = useState("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchFlow = useCallback(async (tickers?: string[]) => {
    setLoading(true);
    setError(null);
    setNeedsSubscription(false);

    const t = tickers ?? ALL_TICKERS;
    try {
      const res  = await fetch(`${WORKER_URL}/options/flow?tickers=${t.join(",")}`);
      const body = await res.json();

      if (res.status === 403 || body?.error === "subscription_required") {
        setNeedsSubscription(true);
        return;
      }
      if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
      setData(body as FlowResponse);
    } catch (e: any) {
      setError(e.message ?? "Failed to fetch options flow.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchFlow();
    // Auto-refresh every 60 s
    intervalRef.current = setInterval(() => fetchFlow(), 60_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle a ticker chip
  function toggleTicker(t: string) {
    setActiveTickers((prev) => {
      const next = new Set(prev);
      if (next.has(t)) { if (next.size > 1) next.delete(t); } // keep at least 1
      else next.add(t);
      return next;
    });
  }

  function addCustomTicker() {
    const t = customTicker.trim().toUpperCase();
    if (!t) return;
    setActiveTickers((prev) => new Set([...prev, t]));
    setCustomTicker("");
  }

  // Apply all filters
  const allContracts = data?.contracts ?? [];
  const filtered = allContracts
    .filter((c) => activeTickers.has(c.underlying_ticker))
    .filter((c) => typeFilter === "all"      || c.contract_type === typeFilter)
    .filter((c) => sideFilter === "all"      || c.side === sideFilter)
    .filter((c) => sentimentFilter === "all" || c.sentiment === sentimentFilter)
    .filter((c) => (c.premium_estimate ?? 0) >= premiumMin)
    .filter((c) => !unusualOnly || isUnusual(c))
    .sort((a, b) => {
      if (sortBy === "volume") return (b.day?.volume ?? 0) - (a.day?.volume ?? 0);
      if (sortBy === "oi")     return (b.day?.open_interest ?? 0) - (a.day?.open_interest ?? 0);
      return (b.premium_estimate ?? 0) - (a.premium_estimate ?? 0);
    });

  // Aggregate stats across filtered set
  const totalPremium  = filtered.reduce((s, c) => s + (c.premium_estimate ?? 0), 0);
  const callPremium   = filtered.filter((c) => c.contract_type === "call").reduce((s, c) => s + (c.premium_estimate ?? 0), 0);
  const putPremium    = filtered.filter((c) => c.contract_type === "put" ).reduce((s, c) => s + (c.premium_estimate ?? 0), 0);
  const bullishCount  = filtered.filter((c) => c.sentiment === "bullish").length;
  const bearishCount  = filtered.filter((c) => c.sentiment === "bearish").length;
  const fetchedAt     = data ? new Date(data.fetched_at).toLocaleTimeString() : null;

  // ── Subscription-required state ────────────────────────────────────────────
  if (needsSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-center py-16 max-w-lg w-full">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="font-display font-bold text-white text-2xl mb-3">Polygon Starter Plan Required</h2>
          <p className="text-brand-muted text-sm mb-2 max-w-md mx-auto">
            Live options flow snapshots require a Polygon.io Starter plan ($29/mo). Once your subscription is active,
            this page will load automatically — no code changes needed.
          </p>
          <p className="text-brand-muted/60 text-xs mb-6 max-w-md mx-auto">
            After subscribing, update <code className="text-brand-gold">POLYGON_KEY</code> in the Cloudflare Worker secrets.
          </p>
          <a href="https://polygon.io/dashboard/signup" target="_blank" rel="noopener noreferrer" className="btn-gold text-sm">
            Subscribe on Polygon.io →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-12 px-4 md:px-6">
      <div className="max-w-screen-xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${fetchedAt ? "bg-brand-green animate-pulse" : "bg-brand-muted"}`} />
              <span className={`text-xs font-bold tracking-wide ${fetchedAt ? "text-brand-green" : "text-brand-muted"}`}>
                {fetchedAt ? `LIVE · ${fetchedAt} · auto-refresh 60s` : loading ? "LOADING…" : "NOT CONNECTED"}
              </span>
            </div>
            <h1 className="font-display font-black text-2xl text-white">Options Order Flow</h1>
            <p className="text-brand-muted text-sm mt-0.5">Real-time unusual options activity · Polygon.io</p>
          </div>
          <button onClick={() => fetchFlow()} disabled={loading} className="btn-gold text-sm py-2 px-5 self-start sm:self-auto whitespace-nowrap">
            {loading ? "Loading…" : "↻ Refresh Now"}
          </button>
        </div>

        {/* ── Stat cards ── */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
            {[
              { label: "Total Premium",  value: fmtPremium(totalPremium), color: "text-brand-gold" },
              { label: "Call Premium",   value: fmtPremium(callPremium),  color: "text-brand-green" },
              { label: "Put Premium",    value: fmtPremium(putPremium),   color: "text-brand-red" },
              { label: "Bullish Flows",  value: bullishCount.toString(),  color: "text-brand-green" },
              { label: "Bearish Flows",  value: bearishCount.toString(),  color: "text-brand-red" },
            ].map((s) => (
              <div key={s.label} className="card py-3 px-4 text-center">
                <div className="text-brand-muted text-[10px] font-semibold mb-0.5 uppercase tracking-wide">{s.label}</div>
                <div className={`font-mono font-bold text-lg ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Filters ── */}
        <div className="card mb-5 space-y-4">

          {/* Ticker chips */}
          <div>
            <p className="text-brand-muted text-[10px] font-bold uppercase tracking-widest mb-2">Tickers</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTickers(new Set(ALL_TICKERS))}
                className="text-xs px-3 py-1.5 rounded-lg border border-brand-gold/30 text-brand-gold bg-brand-gold/10 transition-colors"
              >
                All
              </button>
              {[...new Set([...ALL_TICKERS, ...activeTickers])].map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTicker(t)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-mono ${
                    activeTickers.has(t)
                      ? "bg-brand-card text-white border-brand-border"
                      : "text-brand-muted border-brand-border/50 opacity-40"
                  }`}
                >
                  {t}
                </button>
              ))}
              {/* Custom ticker input */}
              <div className="flex gap-1.5 items-center">
                <input
                  value={customTicker}
                  onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && addCustomTicker()}
                  placeholder="+ ticker"
                  maxLength={6}
                  className="w-20 bg-brand-bg border border-brand-border rounded-lg px-2 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-brand-gold/50"
                />
                <button onClick={addCustomTicker} className="text-xs px-2 py-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-white transition-colors">
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: type / side / sentiment / premium / unusual */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Type */}
            <div className="flex gap-1">
              {(["all", "call", "put"] as const).map((t) => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors capitalize ${
                    typeFilter === t
                      ? t === "call" ? "bg-brand-green/10 text-brand-green border-brand-green/30"
                        : t === "put" ? "bg-brand-red/10 text-brand-red border-brand-red/30"
                        : "bg-brand-gold/10 text-brand-gold border-brand-gold/30"
                      : "text-brand-muted border-brand-border hover:text-white"
                  }`}
                >
                  {t === "all" ? "All Types" : t === "call" ? "Calls" : "Puts"}
                </button>
              ))}
            </div>

            {/* Side */}
            <div className="flex gap-1">
              {(["all", "ask", "bid"] as const).map((s) => (
                <button key={s} onClick={() => setSideFilter(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    sideFilter === s
                      ? s === "ask" ? "bg-brand-green/10 text-brand-green border-brand-green/30"
                        : s === "bid" ? "bg-brand-red/10 text-brand-red border-brand-red/30"
                        : "bg-brand-gold/10 text-brand-gold border-brand-gold/30"
                      : "text-brand-muted border-brand-border hover:text-white"
                  }`}
                >
                  {s === "all" ? "All Sides" : s === "ask" ? "Ask Side" : "Bid Side"}
                </button>
              ))}
            </div>

            {/* Sentiment */}
            <div className="flex gap-1">
              {(["all", "bullish", "bearish"] as const).map((s) => (
                <button key={s} onClick={() => setSentimentFilter(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    sentimentFilter === s
                      ? s === "bullish" ? "bg-brand-green/10 text-brand-green border-brand-green/30"
                        : s === "bearish" ? "bg-brand-red/10 text-brand-red border-brand-red/30"
                        : "bg-brand-gold/10 text-brand-gold border-brand-gold/30"
                      : "text-brand-muted border-brand-border hover:text-white"
                  }`}
                >
                  {s === "all" ? "All Sentiment" : s === "bullish" ? "🟢 Bullish" : "🔴 Bearish"}
                </button>
              ))}
            </div>

            {/* Premium floor */}
            <div className="flex gap-1 ml-auto">
              {PREMIUM_LEVELS.map(({ label, min }) => (
                <button key={label} onClick={() => setPremiumMin(min)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    premiumMin === min ? "bg-brand-gold/10 text-brand-gold border-brand-gold/30" : "text-brand-muted border-brand-border hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Unusual toggle */}
            <button onClick={() => setUnusualOnly((u) => !u)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                unusualOnly ? "bg-brand-gold/10 text-brand-gold border-brand-gold/30" : "text-brand-muted border-brand-border hover:text-white"
              }`}
            >
              ⚡ Unusual Only
            </button>

            {/* Sort */}
            <div className="flex gap-1">
              <span className="text-brand-muted text-xs self-center">Sort:</span>
              {([["premium", "Premium"], ["volume", "Volume"], ["oi", "Open Int."]] as const).map(([v, l]) => (
                <button key={v} onClick={() => setSortBy(v)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    sortBy === v ? "bg-brand-gold/10 text-brand-gold border-brand-gold/30" : "text-brand-muted border-brand-border hover:text-white"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-brand-red/10 border border-brand-red/30 rounded-lg px-4 py-3 text-brand-red text-sm mb-4">
            {error}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && !data && (
          <div className="card text-center py-16">
            <div className="text-brand-gold text-2xl mb-3 animate-pulse">🌊</div>
            <p className="text-brand-muted text-sm">Scanning options flow across {ALL_TICKERS.length} tickers…</p>
          </div>
        )}

        {/* ── Flow table ── */}
        {filtered.length > 0 && (
          <>
            <div className="text-brand-muted text-xs mb-2">
              Showing <span className="text-white font-semibold">{filtered.length}</span> flows
              {filtered.length !== allContracts.length && ` (filtered from ${allContracts.length})`}
            </div>

            <div className="card p-0 overflow-auto">
              <table className="w-full text-sm min-w-[1000px]">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-bg sticky top-0">
                    {[
                      ["Ticker",      "text-left   px-3"],
                      ["Type",        "text-center px-3"],
                      ["Strike",      "text-right  px-3"],
                      ["Expiry",      "text-center px-3"],
                      ["Size",        "text-right  px-3"],
                      ["Last",        "text-right  px-3"],
                      ["VWAP",        "text-right  px-3"],
                      ["High / Low",  "text-right  px-3"],
                      ["Open Int.",   "text-right  px-3"],
                      ["IV",          "text-right  px-3"],
                      ["Premium",     "text-right  px-3"],
                      ["Side",        "text-center px-3"],
                      ["Sentiment",   "text-center px-3"],
                      ["Signal",      "text-center px-3"],
                    ].map(([h, cls]) => (
                      <th key={h} className={`${cls} py-3 text-brand-muted text-xs font-semibold whitespace-nowrap`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 200).map((c) => {
                    const isCall  = c.contract_type === "call";
                    const unusual = isUnusual(c);
                    const iv      = c.implied_volatility ?? c.greeks?.implied_volatility;
                    const vol     = c.day?.volume ?? 0;
                    const oi      = c.day?.open_interest ?? c.open_interest ?? 0;
                    const last    = c.day?.last_price ?? 0;
                    const vwap    = c.day?.vwap ?? 0;
                    const chgPct  = c.day?.change_percent ?? 0;

                    return (
                      <tr
                        key={c.ticker}
                        className={`border-b border-brand-border/40 hover:bg-white/[0.02] transition-colors ${
                          unusual ? "bg-brand-gold/[0.025]" : ""
                        }`}
                      >
                        {/* Ticker */}
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="text-white font-bold text-xs">{c.underlying_ticker}</span>
                          <span className="block text-brand-muted/60 text-[10px] font-mono leading-none mt-0.5">{c.ticker}</span>
                        </td>

                        {/* Type */}
                        <td className="px-3 py-2.5 text-center">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                            isCall
                              ? "bg-brand-green/10 text-brand-green border-brand-green/20"
                              : "bg-brand-red/10 text-brand-red border-brand-red/20"
                          }`}>
                            {isCall ? "CALL" : "PUT"}
                          </span>
                        </td>

                        {/* Strike */}
                        <td className="px-3 py-2.5 text-right text-white font-mono text-xs font-semibold">
                          ${c.strike_price.toLocaleString()}
                        </td>

                        {/* Expiry */}
                        <td className="px-3 py-2.5 text-center text-brand-muted text-xs whitespace-nowrap">
                          {fmtDate(c.expiration_date)}
                        </td>

                        {/* Size (volume in contracts) */}
                        <td className="px-3 py-2.5 text-right font-mono text-xs text-white font-semibold">
                          {vol.toLocaleString()}
                        </td>

                        {/* Last */}
                        <td className="px-3 py-2.5 text-right font-mono text-xs">
                          <span className="text-white">${last.toFixed(2)}</span>
                          {chgPct !== 0 && (
                            <span className={`block text-[10px] leading-none mt-0.5 ${chgPct > 0 ? "text-brand-green" : "text-brand-red"}`}>
                              {chgPct > 0 ? "+" : ""}{chgPct.toFixed(1)}%
                            </span>
                          )}
                        </td>

                        {/* VWAP */}
                        <td className="px-3 py-2.5 text-right text-brand-muted font-mono text-xs">
                          ${vwap.toFixed(2)}
                        </td>

                        {/* High / Low */}
                        <td className="px-3 py-2.5 text-right font-mono text-xs text-brand-muted whitespace-nowrap">
                          <span className="text-brand-green">${(c.day?.high ?? 0).toFixed(2)}</span>
                          {" / "}
                          <span className="text-brand-red">${(c.day?.low ?? 0).toFixed(2)}</span>
                        </td>

                        {/* Open Interest */}
                        <td className="px-3 py-2.5 text-right text-brand-muted font-mono text-xs">
                          {oi.toLocaleString()}
                        </td>

                        {/* IV */}
                        <td className="px-3 py-2.5 text-right text-brand-muted font-mono text-xs">
                          {iv ? `${(iv * 100).toFixed(1)}%` : "—"}
                        </td>

                        {/* Premium */}
                        <td className="px-3 py-2.5 text-right font-mono text-sm font-bold text-brand-gold">
                          {fmtPremium(c.premium_estimate)}
                        </td>

                        {/* Side */}
                        <td className="px-3 py-2.5 text-center">
                          <SideBadge side={c.side} />
                        </td>

                        {/* Sentiment */}
                        <td className="px-3 py-2.5 text-center">
                          <SentimentBadge sentiment={c.sentiment} />
                        </td>

                        {/* Signal */}
                        <td className="px-3 py-2.5 text-center">
                          {unusual && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-gold/10 text-brand-gold border border-brand-gold/20 whitespace-nowrap">
                              ⚡ UNUSUAL
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length > 200 && (
              <p className="text-brand-muted text-xs text-center mt-3">
                Showing 200 of {filtered.length} flows
              </p>
            )}

            <p className="text-brand-muted/40 text-[10px] text-center mt-4">
              Data via Polygon.io · 15-min delay on Starter plan · Side detection: last vs VWAP · Unusual: vol&gt;500 or vol/OI&gt;50% ·
              For educational purposes only.
            </p>
          </>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && data && (
          <div className="card text-center py-12">
            <p className="text-brand-muted text-sm">No flows match the current filters.</p>
            <button
              onClick={() => { setTypeFilter("all"); setSideFilter("all"); setSentimentFilter("all"); setPremiumMin(0); setUnusualOnly(false); }}
              className="text-brand-gold text-xs hover:underline mt-2 block mx-auto"
            >
              Reset all filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function OptionsFlowPage() {
  return (
    <AuthGuard requiredTier="starter">
      <OptionsFlowContent />
    </AuthGuard>
  );
}
