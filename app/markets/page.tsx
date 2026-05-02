"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const MARKETS = [
  {
    name: "Forex",
    icon: "💱",
    desc: "Major, minor, and exotic currency pairs with DXY correlation analysis, COT positioning, and retail sentiment data.",
    pairs: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD"],
    layers: "Order Flow, Technicals, Macro, Sentiment, Intermarket, Microstructure",
  },
  {
    name: "Futures",
    icon: "📈",
    desc: "S&P 500, NASDAQ, Dow, Russell, Gold, Oil, and Natural Gas futures with COT data, large lot detection, and microstructure analysis.",
    pairs: ["ES (S&P 500)", "NQ (NASDAQ)", "YM (Dow)", "GC (Gold)", "CL (Oil)"],
    layers: "Order Flow, Technicals, Macro, COT Data, Microstructure, Intermarket",
  },
  {
    name: "Options",
    icon: "🎯",
    desc: "Options flow analysis with unusual activity detection, IV rank, gamma exposure, max pain, and premium selling setups.",
    pairs: ["SPY Options", "QQQ Options", "AAPL Options", "TSLA Options", "AMD Options"],
    layers: "Order Flow, Options Analytics, AI Pattern Recognition, Technicals",
  },
  {
    name: "Stocks",
    icon: "🏢",
    desc: "US equities with congressional trade tracking, insider filings, dark pool prints, and AI-driven pattern recognition.",
    pairs: ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"],
    layers: "Congressional/Insider, Order Flow, Technicals, Sentiment, AI News",
  },
  {
    name: "Crypto",
    icon: "₿",
    desc: "Bitcoin, Ethereum, and top altcoins with funding rates, open interest, whale movements, and the Crypto Fear & Greed Index.",
    pairs: ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT"],
    layers: "Crypto Signals, Sentiment, Technicals, Order Flow, AI News",
  },
];

function AdvancedChart() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: "FX_IDC:EURUSD",
      interval: "60",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      backgroundColor: "rgba(10, 14, 26, 1)",
      gridColor: "rgba(37, 45, 69, 0.5)",
      height: 500,
      width: "100%",
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div
      className="tradingview-widget-container rounded-xl overflow-hidden border border-brand-border"
      ref={containerRef}
      style={{ height: 500 }}
    >
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }} />
    </div>
  );
}

function EconomicCalendar() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      isTransparent: true,
      width: "100%",
      height: "400",
      locale: "en",
      importanceFilter: "-1,0,1",
      countryFilter: "us,eu,gb,jp,au,ca,ch",
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div
      className="tradingview-widget-container rounded-xl overflow-hidden border border-brand-border"
      ref={containerRef}
      style={{ height: 400 }}
    >
      <div className="tradingview-widget-container__widget" />
    </div>
  );
}

export default function MarketsPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="layer-badge mb-4 inline-block">MARKETS</span>
          <h1 className="font-display font-black text-4xl md:text-6xl text-white leading-tight mb-6">
            Every Market. <span className="text-gradient-gold">One Platform.</span>
          </h1>
          <p className="text-brand-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            OrisTrade covers Forex, Futures, Options, Stocks, and Crypto with 12 layers of intelligence
            tailored to each market's unique characteristics.
          </p>
        </div>
      </section>

      {/* Live Chart */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="text-center mb-8">
          <h2 className="section-title">Live Advanced Chart</h2>
          <p className="section-subtitle">Full TradingView charting with indicators. Change the symbol to explore any market.</p>
        </div>
        <AdvancedChart />
      </section>

      {/* Market Cards */}
      <section className="py-20 px-4 bg-brand-card/30 border-y border-brand-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="layer-badge mb-3 inline-block">COVERAGE</span>
            <h2 className="section-title">Markets We Cover</h2>
            <p className="section-subtitle">
              Each market gets its own tailored signal layers. Here's what's available.
            </p>
          </div>

          <div className="space-y-6">
            {MARKETS.map((market) => (
              <div key={market.name} className="card hover:border-brand-gold/30 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-3xl">
                      {market.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-white text-xl mb-2">{market.name}</h3>
                    <p className="text-brand-muted text-sm leading-relaxed mb-4">{market.desc}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {market.pairs.map((pair) => (
                        <span
                          key={pair}
                          className="bg-brand-bg border border-brand-border text-brand-muted text-xs px-2.5 py-1 rounded-md font-mono"
                        >
                          {pair}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-brand-muted">
                      <span className="text-brand-gold font-semibold">Active Layers:</span> {market.layers}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Economic Calendar */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <span className="layer-badge mb-3 inline-block">CALENDAR</span>
            <h2 className="section-title">Economic Calendar</h2>
            <p className="section-subtitle">
              High-impact events that move markets. OrisTrade automatically suppresses signals within 30 minutes of major news.
            </p>
          </div>
          <EconomicCalendar />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center border-t border-brand-border">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display font-black text-3xl md:text-4xl text-white mb-6">
            Trade Any Market with <span className="text-gradient-gold">Confidence</span>
          </h2>
          <p className="text-brand-muted text-lg mb-8">
            Get 12-layer intelligence for every asset class — from forex to crypto, futures to options.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signals" className="btn-gold text-base py-4 px-8">
              View Live Signals →
            </Link>
            <Link href="/pricing" className="btn-outline text-base py-4 px-8">
              See Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
