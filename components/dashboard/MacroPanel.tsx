"use client";

import { useEffect, useState } from "react";
import { getMacroSnapshot, scoreMacro, type MacroSnapshot } from "../../lib/api/macro-client";

interface MetricCardProps {
  label: string;
  value: string | null;
  unit: string;
  note: string;
  signal?: "bullish" | "bearish" | "neutral";
}

function MetricCard({ label, value, unit, note, signal }: MetricCardProps) {
  const color =
    signal === "bullish" ? "text-brand-green" :
    signal === "bearish" ? "text-brand-red" :
    "text-white";

  return (
    <div className="bg-brand-bg border border-brand-border rounded-xl p-4 hover:border-brand-gold/20 transition-colors">
      <div className="text-brand-muted text-xs font-medium mb-1">{label}</div>
      <div className={`font-display font-bold text-2xl mb-1 ${color}`}>
        {value !== null ? `${value}${unit}` : "—"}
      </div>
      <div className="text-brand-muted text-xs leading-relaxed">{note}</div>
    </div>
  );
}

function YieldCurveBar({ spread }: { spread: number | null }) {
  if (spread === null) return null;

  const isInverted = spread < 0;
  const absWidth = Math.min(Math.abs(spread) * 20, 100);

  return (
    <div className="bg-brand-bg border border-brand-border rounded-xl p-4">
      <div className="text-brand-muted text-xs font-medium mb-2">Yield Curve (10Y − 2Y Spread)</div>
      <div className="flex items-center gap-3 mb-2">
        <span className={`font-display font-bold text-2xl ${isInverted ? "text-brand-red" : "text-brand-green"}`}>
          {spread > 0 ? "+" : ""}{spread?.toFixed(2)}%
        </span>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
            isInverted
              ? "bg-brand-red/10 text-brand-red border-brand-red/30"
              : "bg-brand-green/10 text-brand-green border-brand-green/30"
          }`}
        >
          {isInverted ? "INVERTED ⚠️" : "NORMAL ✓"}
        </span>
      </div>
      <div className="h-3 bg-brand-border rounded-full overflow-hidden flex items-center">
        {isInverted ? (
          <div
            className="h-full bg-brand-red/80 rounded-full ml-auto"
            style={{ width: `${absWidth}%` }}
          />
        ) : (
          <div
            className="h-full bg-brand-green/80 rounded-full"
            style={{ width: `${absWidth}%` }}
          />
        )}
      </div>
      <div className="text-brand-muted text-xs mt-2">
        {isInverted
          ? "Inverted yield curve — historically precedes recession. Bearish macro signal."
          : "Normal yield curve — healthy economic environment. Bullish macro signal."}
      </div>
    </div>
  );
}

export function MacroPanel() {
  const [data, setData] = useState<MacroSnapshot | null>(null);
  const [score, setScore] = useState<{ score: number; notes: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMacroSnapshot()
      .then((snap) => {
        setData(snap);
        setScore(scoreMacro(snap));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const scoreColor =
    score && score.score >= 60 ? "text-brand-green" :
    score && score.score <= 40 ? "text-brand-red" :
    "text-brand-gray";

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
            <span className="text-brand-gold text-xs font-bold">3</span>
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-lg leading-tight">Macro & Economic</h3>
            <p className="text-brand-muted text-xs">World Bank API — Inflation, GDP, Unemployment</p>
          </div>
        </div>
        {score && !loading && (
          <div className="text-right">
            <div className={`font-display font-bold text-2xl ${scoreColor}`}>{score.score}</div>
            <div className="text-brand-muted text-xs">Layer score</div>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3">
          <div className="w-5 h-5 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
          <span className="text-brand-muted text-sm">Loading FRED data…</span>
        </div>
      )}

      {error && (
        <div className="bg-brand-red/10 border border-brand-red/30 rounded-lg px-4 py-3 text-brand-red text-sm">
          ⚠️ FRED API unavailable: {error}
        </div>
      )}

      {data && !loading && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <MetricCard
              label="Fed Funds Rate"
              value={data.fedFundsRate !== null ? data.fedFundsRate.toFixed(2) : null}
              unit="%"
              note="Current target rate — higher = tighter policy"
              signal={data.fedFundsRate !== null ? (data.fedFundsRate >= 4.5 ? "bearish" : data.fedFundsRate <= 2 ? "bullish" : "neutral") : "neutral"}
            />
            <MetricCard
              label="10Y Treasury Yield"
              value={data.treasury10y !== null ? data.treasury10y.toFixed(2) : null}
              unit="%"
              note="Benchmark rate — rising = tightening conditions"
              signal={data.treasury10y !== null ? (data.treasury10y > 4.5 ? "bearish" : data.treasury10y < 3 ? "bullish" : "neutral") : "neutral"}
            />
            <MetricCard
              label="2Y Treasury Yield"
              value={data.treasury2y !== null ? data.treasury2y.toFixed(2) : null}
              unit="%"
              note="Short-term rate expectations"
              signal="neutral"
            />
            <MetricCard
              label="CPI Index"
              value={data.cpi !== null ? data.cpi.toFixed(1) : null}
              unit=""
              note="Consumer Price Index — trend matters more than level"
              signal="neutral"
            />
            <MetricCard
              label="Unemployment"
              value={data.unemployment !== null ? data.unemployment.toFixed(1) : null}
              unit="%"
              note="Low unemployment = Fed stays hawkish"
              signal={data.unemployment !== null ? (data.unemployment < 4 ? "bearish" : data.unemployment > 5 ? "bullish" : "neutral") : "neutral"}
            />
          </div>

          <YieldCurveBar spread={data.yieldSpread} />

          {score && score.notes.length > 0 && (
            <div className="mt-4 space-y-1.5">
              <div className="text-brand-muted text-xs font-medium">SIGNAL NOTES</div>
              {score.notes.map((note, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-brand-muted">
                  <span className="text-brand-gold mt-0.5 flex-shrink-0">→</span>
                  {note}
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 text-brand-muted text-xs text-right">
            Updated: {new Date(data.updatedAt).toLocaleTimeString()}
          </div>
        </>
      )}
    </div>
  );
}
