"use client";

import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { SignalDirection } from "../../lib/signals/scoring";

export interface Signal {
  symbol: string;
  timeframe: string;
  score: number;
  direction: SignalDirection;
  entry: number;
  stopLoss: number;
  target1: number;
  target2: number;
  rrRatio: string;
  reasons: { text: string; type: "positive" | "warning" | "negative" }[];
  timestamp: string;
  locked?: boolean;
}

const DIRECTION_CONFIG: Record<SignalDirection, { label: string; color: string; bgColor: string; emoji: string }> = {
  STRONG_BUY: { label: "STRONG BUY", color: "text-brand-green", bgColor: "bg-brand-green/10 border-brand-green/30", emoji: "🟢" },
  BUY: { label: "BUY", color: "text-brand-green", bgColor: "bg-brand-green/10 border-brand-green/20", emoji: "🟡" },
  WAIT: { label: "WAIT", color: "text-brand-gray", bgColor: "bg-brand-gray/10 border-brand-gray/20", emoji: "⚪" },
  SELL: { label: "SELL", color: "text-brand-red", bgColor: "bg-brand-red/10 border-brand-red/20", emoji: "🟠" },
  STRONG_SELL: { label: "STRONG SELL", color: "text-brand-red", bgColor: "bg-brand-red/10 border-brand-red/30", emoji: "🔴" },
};

function getScoreColor(score: number) {
  if (score >= 80) return "from-brand-green to-brand-green/80";
  if (score >= 60) return "from-yellow-400 to-yellow-400/80";
  if (score >= 40) return "from-brand-gray to-brand-gray/80";
  if (score >= 20) return "from-orange-400 to-orange-400/80";
  return "from-brand-red to-brand-red/80";
}

export function SignalCard({ signal }: { signal: Signal }) {
  const [animated, setAnimated] = useState(false);
  const config = DIRECTION_CONFIG[signal.direction];

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={clsx("signal-card relative", signal.locked && "overflow-hidden")}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-brand-border">
        <div>
          <span className="font-display font-bold text-lg text-white">{signal.symbol}</span>
          <span className="ml-2 text-brand-muted text-sm">{signal.timeframe}</span>
        </div>
        <span className="text-brand-muted text-xs">{signal.timestamp}</span>
      </div>

      {/* Score bar */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-brand-muted text-xs font-medium">CONFLUENCE SCORE</span>
          <span className="font-display font-bold text-2xl text-white">{signal.score}/100</span>
        </div>
        <div className="h-3 bg-brand-border rounded-full overflow-hidden">
          <div
            className={clsx(
              "h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out",
              getScoreColor(signal.score)
            )}
            style={{ width: animated ? `${signal.score}%` : "0%" }}
          />
        </div>
      </div>

      {/* Direction */}
      <div className={clsx("mx-4 my-3 rounded-lg border px-4 py-3 text-center", config.bgColor)}>
        <span className={clsx("font-display font-black text-xl tracking-wide", config.color)}>
          {config.emoji} {config.label}
        </span>
      </div>

      {/* Price levels */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-2 text-sm">
        <div className="bg-brand-bg rounded-lg p-2">
          <div className="text-brand-muted text-xs mb-0.5">Entry</div>
          <div className="text-white font-mono font-semibold">{signal.entry.toFixed(4)}</div>
        </div>
        <div className="bg-brand-bg rounded-lg p-2">
          <div className="text-brand-muted text-xs mb-0.5">Stop Loss</div>
          <div className="text-brand-red font-mono font-semibold">{signal.stopLoss.toFixed(4)}</div>
        </div>
        <div className="bg-brand-bg rounded-lg p-2">
          <div className="text-brand-muted text-xs mb-0.5">Target 1</div>
          <div className="text-brand-green font-mono font-semibold">{signal.target1.toFixed(4)}</div>
        </div>
        <div className="bg-brand-bg rounded-lg p-2">
          <div className="text-brand-muted text-xs mb-0.5">Target 2</div>
          <div className="text-brand-green font-mono font-semibold">{signal.target2.toFixed(4)}</div>
        </div>
      </div>

      {/* R:R Ratio */}
      <div className="px-4 pb-3">
        <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-lg px-3 py-2 flex justify-between items-center">
          <span className="text-brand-muted text-xs">Risk:Reward Ratio</span>
          <span className="text-brand-gold font-bold font-mono">{signal.rrRatio}</span>
        </div>
      </div>

      {/* Reasons */}
      <div className="px-4 pb-4">
        <div className="text-brand-muted text-xs font-medium mb-2">WHY THIS SIGNAL?</div>
        <div className="space-y-1.5">
          {signal.reasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 flex-shrink-0">
                {reason.type === "positive" ? "✅" : reason.type === "warning" ? "⚠️" : "❌"}
              </span>
              <span className={clsx(
                reason.type === "positive" ? "text-white/80" :
                reason.type === "warning" ? "text-yellow-400/80" : "text-brand-red/80"
              )}>
                {reason.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Members-only overlay */}
      {signal.locked && (
        <div className="absolute inset-0 backdrop-blur-[6px] bg-brand-bg/60 flex flex-col items-center justify-center gap-4">
          <div className="text-center px-6">
            <div className="text-3xl mb-2">🔒</div>
            <div className="font-display font-bold text-white text-lg mb-1">Members Only</div>
            <p className="text-brand-muted text-sm">
              Join OrisTrade to access live signals with entry, stop loss & targets.
            </p>
          </div>
          <a href="/pricing" className="btn-gold text-sm">
            Unlock Signals →
          </a>
        </div>
      )}
    </div>
  );
}
