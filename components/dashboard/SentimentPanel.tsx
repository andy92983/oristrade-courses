"use client";

import { useEffect, useState } from "react";
import { getSentimentSnapshot, type SentimentSnapshot } from "../../lib/api/sentiment-client";

function FearGreedGauge({ value }: { value: number }) {
  // SVG arc gauge
  const radius = 70;
  const stroke = 12;
  const cx = 100;
  const cy = 90;
  const startAngle = -180;
  const endAngle = 0;
  const totalArc = endAngle - startAngle;
  const filled = (value / 100) * totalArc + startAngle;

  const toRad = (d: number) => (d * Math.PI) / 180;
  const arcPath = (start: number, end: number) => {
    const sx = cx + radius * Math.cos(toRad(start));
    const sy = cy + radius * Math.sin(toRad(start));
    const ex = cx + radius * Math.cos(toRad(end));
    const ey = cy + radius * Math.sin(toRad(end));
    const large = end - start > 180 ? 1 : 0;
    return `M ${sx} ${sy} A ${radius} ${radius} 0 ${large} 1 ${ex} ${ey}`;
  };

  const getColor = (v: number) => {
    if (v <= 20) return "#FF4444";
    if (v <= 40) return "#FF8C00";
    if (v <= 60) return "#AAAAAA";
    if (v <= 80) return "#7BC67E";
    return "#00C851";
  };

  const color = getColor(value);

  // Needle tip
  const needleAngle = startAngle + (value / 100) * totalArc;
  const needleX = cx + (radius - 10) * Math.cos(toRad(needleAngle));
  const needleY = cy + (radius - 10) * Math.sin(toRad(needleAngle));

  return (
    <svg viewBox="0 0 200 110" className="w-full max-w-xs mx-auto">
      {/* Background arc */}
      <path
        d={arcPath(startAngle, endAngle)}
        fill="none"
        stroke="#252D45"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      {/* Filled arc */}
      <path
        d={arcPath(startAngle, filled)}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        style={{ transition: "all 1s ease-out" }}
      />
      {/* Zone labels */}
      {["Extreme\nFear", "Fear", "Neutral", "Greed", "Extreme\nGreed"].map((label, i) => {
        const angle = startAngle + (i / 4) * totalArc;
        const lx = cx + (radius + 18) * Math.cos(toRad(angle));
        const ly = cy + (radius + 18) * Math.sin(toRad(angle));
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" className="fill-current" style={{ fontSize: 6, fill: "#8892A4" }}>
            {label.split("\n").map((l, j) => (
              <tspan key={j} x={lx} dy={j === 0 ? 0 : 8}>{l}</tspan>
            ))}
          </text>
        );
      })}
      {/* Needle */}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={5} fill={color} />
      {/* Center value */}
      <text x={cx} y={cy - 20} textAnchor="middle" style={{ fontSize: 22, fontWeight: 900, fill: color, fontFamily: "Outfit, sans-serif" }}>
        {value}
      </text>
    </svg>
  );
}

export function SentimentPanel() {
  const [data, setData] = useState<SentimentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSentimentSnapshot()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const fg = data?.cryptoFearGreed;

  const labelColor = (label: string) => {
    if (label.toLowerCase().includes("extreme fear")) return "text-brand-red";
    if (label.toLowerCase().includes("fear"))         return "text-orange-400";
    if (label.toLowerCase().includes("extreme greed")) return "text-brand-green";
    if (label.toLowerCase().includes("greed"))        return "text-yellow-400";
    return "text-brand-gray";
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
            <span className="text-brand-gold text-xs font-bold">4</span>
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-lg leading-tight">Sentiment Intelligence</h3>
            <p className="text-brand-muted text-xs">Alternative.me — live data</p>
          </div>
        </div>
        {data && !loading && (
          <div className="text-right">
            <div className={`font-display font-bold text-2xl ${data.score >= 60 ? "text-brand-green" : data.score <= 40 ? "text-brand-red" : "text-brand-gray"}`}>
              {data.score}
            </div>
            <div className="text-brand-muted text-xs">Layer score</div>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10 gap-3">
          <div className="w-5 h-5 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
          <span className="text-brand-muted text-sm">Loading sentiment data…</span>
        </div>
      )}

      {error && (
        <div className="bg-brand-red/10 border border-brand-red/30 rounded-lg px-4 py-3 text-brand-red text-sm">
          ⚠️ Sentiment API unavailable: {error}
        </div>
      )}

      {fg && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Gauge */}
          <div>
            <FearGreedGauge value={fg.value} />
            <div className="text-center mt-1">
              <span className={`font-display font-bold text-xl ${labelColor(fg.label)}`}>
                {fg.label}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="bg-brand-bg border border-brand-border rounded-xl p-4">
              <div className="text-brand-muted text-xs mb-1">Crypto Fear & Greed</div>
              <div className={`font-display font-bold text-3xl ${labelColor(fg.label)}`}>{fg.value}</div>
              <div className="text-brand-muted text-xs mt-1">out of 100</div>
            </div>

            <div className="bg-brand-bg border border-brand-border rounded-xl p-4">
              <div className="text-brand-muted text-xs mb-1.5 font-medium">Contrarian Reading</div>
              {data && data.notes.map((note, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-brand-muted">
                  <span className="text-brand-gold flex-shrink-0 mt-0.5">→</span>
                  {note}
                </div>
              ))}
            </div>

            <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-xl p-4">
              <div className="text-brand-gold text-xs font-semibold mb-1">Coming in Phase 2</div>
              <div className="text-brand-muted text-xs space-y-1">
                <div>• CBOE Put/Call Ratio</div>
                <div>• CNN Fear & Greed Index</div>
                <div>• AAII Investor Survey</div>
                <div>• Smart Money Divergence</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {fg && (
        <div className="mt-3 text-brand-muted text-xs text-right">
          Updated: {new Date(fg.updatedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}
