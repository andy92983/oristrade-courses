"use client";

import { useEffect, useRef, useState } from "react";

interface TechAnalysisProps {
  symbol: string;
  label: string;
}

export function TechAnalysisWidget({ symbol, label }: TechAnalysisProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);

  // Fetch live price from TradingView API
  const fetchPrice = async () => {
    try {
      // Use alternative free API for stock quotes
      const response = await fetch(
        `https://api.alternative.me/quotes/?symbols=${symbol}&convert=USD`
      );
      const data = await response.json();
      if (data.data?.[symbol]) {
        const quote = data.data[symbol].quote?.USD;
        if (quote) {
          setPrice(quote.price);
          setPriceChange(quote.percent_change_24h);
        }
      }
    } catch {
      // Fallback: try simplified fetch
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=demo`
        );
        const data = await res.json();
        if (data.c) {
          setPrice(data.c);
          setPriceChange(data.dp);
        }
      } catch {
        // Silently fail - TradingView widget displays live data
      }
    }
  };

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, [symbol]);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      interval: "1",
      width: "100%",
      isTransparent: true,
      height: 400,
      symbol,
      showIntervalTabs: true,
      displayMode: "single",
      locale: "en",
      colorTheme: "dark",
    });

    containerRef.current.appendChild(script);
    return () => { if (containerRef.current) containerRef.current.innerHTML = ""; };
  }, [symbol]);

  return (
    <div className="bg-brand-bg border border-brand-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-brand-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-white font-semibold text-sm">{label}</span>
            <span className="text-brand-muted text-xs font-mono ml-2">{symbol}</span>
          </div>
        </div>
        <div className="text-right">
          {price && (
            <div className="flex flex-col items-end">
              <div className="text-white font-mono font-bold text-lg">${price.toFixed(2)}</div>
              <div className={`text-xs font-mono ${priceChange && priceChange >= 0 ? "text-brand-green" : "text-brand-red"}`}>
                {priceChange ? (priceChange >= 0 ? "+" : "") + priceChange.toFixed(2) + "%" : "—"}
              </div>
              <div className="text-brand-muted text-xs mt-1">Updates every 60s</div>
            </div>
          )}
        </div>
      </div>
      <div ref={containerRef} className="tradingview-widget-container">
        <div className="tradingview-widget-container__widget" />
      </div>
    </div>
  );
}

// Mini chart widget
export function MiniChartWidget({ symbol, label }: TechAnalysisProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width: "100%",
      height: 220,
      locale: "en",
      dateRange: "1D",
      colorTheme: "dark",
      isTransparent: true,
      autosize: true,
      largeChartUrl: "",
      noTimeScale: false,
      chartOnly: false,
    });

    containerRef.current.appendChild(script);
    return () => { if (containerRef.current) containerRef.current.innerHTML = ""; };
  }, [symbol]);

  return (
    <div className="bg-brand-bg border border-brand-border rounded-xl overflow-hidden">
      <div ref={containerRef} className="tradingview-widget-container">
        <div className="tradingview-widget-container__widget" />
      </div>
    </div>
  );
}
