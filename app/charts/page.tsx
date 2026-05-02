"use client";

import { useState, useEffect, useRef } from "react";
import { AuthGuard } from "../../components/auth/AuthGuard";
import { useAuth } from "../../lib/supabase/useAuth";

const SYMBOLS = [
  { label: "ES1!", value: "CME_MINI:ES1!" },
  { label: "NQ1!", value: "CME_MINI:NQ1!" },
  { label: "SPX",  value: "SP:SPX" },
  { label: "SPY",  value: "AMEX:SPY" },
  { label: "QQQ",  value: "NASDAQ:QQQ" },
  { label: "AAPL", value: "NASDAQ:AAPL" },
  { label: "TSLA", value: "NASDAQ:TSLA" },
  { label: "NVDA", value: "NASDAQ:NVDA" },
  { label: "GC1!", value: "COMEX:GC1!" },
  { label: "CL1!", value: "NYMEX:CL1!" },
  { label: "EURUSD", value: "FX:EURUSD" },
  { label: "BTCUSD", value: "BITSTAMP:BTCUSD" },
];

const TIMEFRAMES = [
  { label: "1m",  value: "1" },
  { label: "5m",  value: "5" },
  { label: "15m", value: "15" },
  { label: "1H",  value: "60" },
  { label: "4H",  value: "240" },
  { label: "1D",  value: "D" },
];

function AdvancedChart({ symbol, tf }: { symbol: string; tf: string }) {
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Clear any previous widget
    el.innerHTML = "";

    // TradingView requires the widget div to exist BEFORE the script runs
    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width  = "100%";
    el.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src   = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.type  = "text/javascript";
    script.innerHTML = JSON.stringify({
      autosize:           true,
      symbol,
      interval:           tf,
      theme:              "dark",
      style:              "1",
      locale:             "en",
      allow_symbol_change: true,
      hide_side_toolbar:  false,
      backgroundColor:    "rgba(10, 14, 26, 1)",
      gridColor:          "rgba(37, 45, 69, 0.5)",
      withdateranges:     true,
      save_image:         false,
      support_host:       "https://www.tradingview.com",
    });
    el.appendChild(script);

    return () => { el.innerHTML = ""; };
  }, [symbol, tf]);

  return (
    // Outer wrapper sets the actual pixel height for the chart area
    <div
      ref={wrapperRef}
      className="w-full rounded-xl overflow-hidden border border-brand-border"
      style={{ height: "calc(100vh - 220px)", minHeight: 540 }}
    >
      {/* Inner div carries the TradingView class names — must match 100% of wrapper */}
      <div
        ref={containerRef}
        className="tradingview-widget-container"
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}

function TechAnalysisWidget({ symbol }: { symbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    el.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    script.async = true;
    script.type  = "text/javascript";
    script.innerHTML = JSON.stringify({
      interval:        "1h",
      width:           "100%",
      isTransparent:   true,
      height:          420,
      symbol,
      showIntervalTabs: true,
      locale:          "en",
      colorTheme:      "dark",
    });
    el.appendChild(script);

    return () => { el.innerHTML = ""; };
  }, [symbol]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container w-full rounded-xl overflow-hidden border border-brand-border bg-brand-card"
      style={{ height: 420 }}
    />
  );
}

function EcoCalendar() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    el.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src  = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.async = true;
    script.type  = "text/javascript";
    script.innerHTML = JSON.stringify({
      colorTheme:       "dark",
      isTransparent:    true,
      width:            "100%",
      height:           350,
      locale:           "en",
      importanceFilter: "0,1",
      countryFilter:    "us,eu,gb,jp,cn",
    });
    el.appendChild(script);

    return () => { el.innerHTML = ""; };
  }, []);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container w-full rounded-xl overflow-hidden border border-brand-border bg-brand-card"
      style={{ height: 350 }}
    />
  );
}

function ChartsContent() {
  const [symbol, setSymbol] = useState(SYMBOLS[4].value); // default QQQ
  const [tf, setTf]         = useState("5");
  const [showEco, setShowEco] = useState(false);
  const { profile } = useAuth();

  const isPro = profile && ["pro", "elite", "vip"].includes(profile.tier);

  return (
    <div className="min-h-screen pt-20 pb-6 px-3">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display font-bold text-xl text-white">
            Live Charts
          </h1>
          <button
            onClick={() => setShowEco(!showEco)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
              showEco
                ? "bg-brand-gold/10 text-brand-gold border-brand-gold/30"
                : "text-brand-muted border-brand-border hover:text-white"
            }`}
          >
            📅 Eco Calendar
          </button>
        </div>

        {/* Symbol Quick-Switch */}
        <div className="flex flex-wrap gap-2 mb-3">
          {SYMBOLS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSymbol(s.value)}
              className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all duration-150 ${
                symbol === s.value
                  ? "bg-brand-gold text-brand-bg border-brand-gold font-bold"
                  : "text-brand-muted border-brand-border hover:text-white hover:border-brand-gold/40"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Timeframe Tabs */}
        <div className="flex gap-1 mb-4">
          {TIMEFRAMES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTf(t.value)}
              className={`text-xs font-mono px-3 py-1 rounded-md transition-all duration-150 ${
                tf === t.value
                  ? "bg-brand-card text-white border border-brand-gold/40"
                  : "text-brand-muted hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Main Chart */}
        <AdvancedChart symbol={symbol} tf={tf} />

        {/* Eco Calendar (collapsible) */}
        {showEco && (
          <div className="mt-4">
            <h2 className="text-white text-sm font-semibold mb-2">Economic Calendar</h2>
            <EcoCalendar />
          </div>
        )}

        {/* Technical Analysis (Pro+ gated) */}
        <div className="mt-4">
          {isPro ? (
            <>
              <h2 className="text-white text-sm font-semibold mb-2">Technical Analysis Summary</h2>
              <TechAnalysisWidget symbol={symbol} />
            </>
          ) : (
            <div className="card text-center py-8">
              <div className="text-2xl mb-2">🔒</div>
              <p className="text-white font-semibold text-sm mb-1">Technical Analysis Summary</p>
              <p className="text-brand-muted text-xs mb-4">Available on Pro plan and above</p>
              <a href="/pricing" className="btn-gold text-xs py-2 px-4 inline-block">
                Upgrade to Pro →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChartsPage() {
  return (
    <AuthGuard requiredTier="starter">
      <ChartsContent />
    </AuthGuard>
  );
}
