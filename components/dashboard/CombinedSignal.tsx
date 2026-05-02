"use client";

import { useEffect, useState } from "react";
import { getMacroSnapshot, scoreMacro } from "../../lib/api/macro-client";
import { getSentimentSnapshot } from "../../lib/api/sentiment-client";
import { calculateWeightedScore, createLayerScore, getSignalDirection } from "../../lib/signals/scoring";

type Direction = "STRONG_BUY" | "BUY" | "WAIT" | "SELL" | "STRONG_SELL";

const DIR_CONFIG: Record<Direction, { label: string; color: string; bg: string; emoji: string }> = {
  STRONG_BUY:  { label: "STRONG BUY",  color: "text-brand-green", bg: "bg-brand-green/10 border-brand-green/30",  emoji: "🟢" },
  BUY:         { label: "BUY",         color: "text-brand-green", bg: "bg-brand-green/10 border-brand-green/20",  emoji: "🟡" },
  WAIT:        { label: "WAIT",        color: "text-brand-gray",  bg: "bg-brand-gray/10 border-brand-gray/20",    emoji: "⚪" },
  SELL:        { label: "SELL",        color: "text-brand-red",   bg: "bg-brand-red/10 border-brand-red/20",      emoji: "🟠" },
  STRONG_SELL: { label: "STRONG SELL", color: "text-brand-red",   bg: "bg-brand-red/10 border-brand-red/30",      emoji: "🔴" },
};

export function CombinedSignal() {
  const [score, setScore] = useState<number | null>(null);
  const [direction, setDirection] = useState<Direction | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [animated, setAnimated] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    async function compute() {
      try {
        const [macroSnap, sentimentSnap] = await Promise.allSettled([
          getMacroSnapshot(),
          getSentimentSnapshot(),
        ]);

        const layers = [];
        const allNotes: string[] = [];

        // Layer 3: Macro (10% weight)
        if (macroSnap.status === "fulfilled") {
          const { score: mScore, notes: mNotes } = scoreMacro(macroSnap.value);
          layers.push(createLayerScore(3, mScore, mNotes, true));
          allNotes.push(...mNotes);
        } else {
          layers.push(createLayerScore(3, 50, ["Macro data unavailable"], false));
        }

        // Layer 4: Sentiment (10% weight)
        if (sentimentSnap.status === "fulfilled") {
          const s = sentimentSnap.value;
          layers.push(createLayerScore(4, s.score, s.notes, true));
          allNotes.push(...s.notes);
        } else {
          layers.push(createLayerScore(4, 50, ["Sentiment data unavailable"], false));
        }

        // Layers not yet available — mark as unavailable so they're excluded from weighting
        [1, 2, 5, 6, 7, 8, 9, 10, 11, 12].forEach((n) => {
          layers.push(createLayerScore(n as Parameters<typeof createLayerScore>[0], 50, [], false));
        });

        const totalScore = calculateWeightedScore(layers.filter((l) => l.available));
        setScore(totalScore);
        setDirection(getSignalDirection(totalScore));
        setNotes(allNotes.slice(0, 5));
        setLastUpdated(new Date().toLocaleTimeString());
        setTimeout(() => setAnimated(true), 200);
      } catch {
        setScore(50);
        setDirection("WAIT");
      } finally {
        setLoading(false);
      }
    }
    compute();
  }, []);

  const dir = direction ? DIR_CONFIG[direction] : null;

  return (
    <div className="card border-brand-gold/30 glow-gold relative overflow-hidden">
      {/* Live badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
        <span className="text-brand-green text-xs font-semibold">LIVE</span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center">
          <span className="text-brand-bg font-display font-black text-sm">OS</span>
        </div>
        <div>
          <h3 className="font-display font-bold text-white text-xl">OrisTrade Signal Engine</h3>
          <p className="text-brand-muted text-xs">Phase 1 — Layers 3 & 4 active (Macro + Sentiment)</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-3">
          <div className="w-6 h-6 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
          <span className="text-brand-muted">Computing confluence score…</span>
        </div>
      ) : (
        <>
          {/* Score bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-brand-muted text-xs font-medium">CONFLUENCE SCORE (Phase 1 — 2/12 layers)</span>
              <span className="font-display font-bold text-3xl text-white">{score}/100</span>
            </div>
            <div className="h-4 bg-brand-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out ${
                  score! >= 60 ? "from-brand-green to-brand-green/80" :
                  score! <= 40 ? "from-brand-red to-brand-red/80" :
                  "from-brand-gray to-brand-gray/80"
                }`}
                style={{ width: animated ? `${score}%` : "0%" }}
              />
            </div>
          </div>

          {/* Direction */}
          {dir && (
            <div className={`rounded-xl border px-6 py-4 text-center mb-4 ${dir.bg}`}>
              <span className={`font-display font-black text-2xl tracking-wide ${dir.color}`}>
                {dir.emoji} {dir.label}
              </span>
            </div>
          )}

          {/* Signal notes */}
          <div className="space-y-2 mb-4">
            <div className="text-brand-muted text-xs font-medium">SIGNAL REASONING</div>
            {notes.map((note, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                <span className="text-brand-gold flex-shrink-0 mt-0.5">→</span>
                {note}
              </div>
            ))}
          </div>

          {/* Active / Locked layers */}
          <div className="bg-brand-bg rounded-xl border border-brand-border p-4">
            <div className="text-brand-muted text-xs font-medium mb-3">LAYER CONTRIBUTIONS</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-brand-green">✓</span>
                <span className="text-white">Layer 3: Macro ({10}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-green">✓</span>
                <span className="text-white">Layer 4: Sentiment ({10}%)</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 pt-1 border-t border-brand-border mt-1">
                <span className="text-brand-gold/50">○</span>
                <span className="text-brand-muted">Layers 1,2,5-12: Unlocking in Phase 2 & 3</span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-brand-muted text-xs flex justify-between">
            <span>⚠️ Educational data only — not financial advice</span>
            <span>Updated: {lastUpdated}</span>
          </div>
        </>
      )}
    </div>
  );
}
