"use client";

const LAYERS = [
  { num: 1,  name: "Order Flow",          status: "phase2",  note: "Polygon.io — Phase 2" },
  { num: 2,  name: "Technicals",          status: "active",  note: "TradingView widgets" },
  { num: 3,  name: "Macro Data",          status: "active",  note: "FRED API — live" },
  { num: 4,  name: "Sentiment",           status: "active",  note: "Alternative.me — live" },
  { num: 5,  name: "Congressional",       status: "phase2",  note: "SEC EDGAR — Phase 2" },
  { num: 6,  name: "Intermarket",         status: "phase2",  note: "Calculated — Phase 2" },
  { num: 7,  name: "Microstructure",      status: "phase3",  note: "Phase 3" },
  { num: 8,  name: "AI Patterns",         status: "phase3",  note: "Phase 3" },
  { num: 9,  name: "Options Analytics",   status: "phase2",  note: "Polygon.io — Phase 2" },
  { num: 10, name: "AI News",             status: "phase3",  note: "Phase 3" },
  { num: 11, name: "Crypto Signals",      status: "active",  note: "Alternative.me — live" },
  { num: 12, name: "Proprietary",         status: "phase3",  note: "Phase 3" },
];

export function LayerStatus() {
  const active  = LAYERS.filter((l) => l.status === "active").length;
  const total   = LAYERS.length;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-white text-lg">Signal Engine Status</h3>
        <span className="text-brand-gold text-sm font-mono">
          {active}/{total} layers active
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-brand-border rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-gold to-brand-gold-light rounded-full transition-all duration-700"
          style={{ width: `${(active / total) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {LAYERS.map((layer) => (
          <div
            key={layer.num}
            title={layer.note}
            className={`rounded-lg p-2.5 border text-center transition-all duration-200 ${
              layer.status === "active"
                ? "bg-brand-green/10 border-brand-green/30"
                : layer.status === "phase2"
                ? "bg-brand-gold/5 border-brand-gold/15"
                : "bg-brand-card border-brand-border opacity-50"
            }`}
          >
            <div
              className={`text-xs font-bold mb-0.5 ${
                layer.status === "active"
                  ? "text-brand-green"
                  : layer.status === "phase2"
                  ? "text-brand-gold/60"
                  : "text-brand-muted"
              }`}
            >
              L{layer.num}
            </div>
            <div className="text-white text-xs leading-tight">{layer.name}</div>
            <div className="mt-1">
              {layer.status === "active" ? (
                <span className="text-brand-green text-xs">● Live</span>
              ) : layer.status === "phase2" ? (
                <span className="text-brand-gold/50 text-xs">○ P2</span>
              ) : (
                <span className="text-brand-muted text-xs">○ P3</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
