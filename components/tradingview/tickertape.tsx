"use client";

import { useEffect, useRef } from "react";

// Symbols shown in the ticker tape
const TICKER_SYMBOLS = [
  { proName: "FX_IDC:EURUSD", title: "EUR/USD" },
  { proName: "FX_IDC:GBPUSD", title: "GBP/USD" },
  { proName: "FX_IDC:USDJPY", title: "USD/JPY" },
  { proName: "FX_IDC:AUDUSD", title: "AUD/USD" },
  { proName: "COMEX:GC1!", title: "Gold" },
  { proName: "NYMEX:CL1!", title: "Oil" },
  { proName: "CME_MINI:ES1!", title: "S&P 500" },
  { proName: "CME_MINI:NQ1!", title: "NASDAQ" },
  { proName: "BINANCE:BTCUSDT", title: "Bitcoin" },
  { proName: "BINANCE:ETHUSDT", title: "Ethereum" },
  { proName: "CBOE:VIX", title: "VIX" },
  { proName: "TVC:DXY", title: "DXY" },
];

export function TickerTape() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: TICKER_SYMBOLS,
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "en",
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="w-full border-b border-brand-border bg-brand-card/50">
      <div className="tradingview-widget-container" ref={containerRef}>
        <div className="tradingview-widget-container__widget" />
      </div>
    </div>
  );
}
