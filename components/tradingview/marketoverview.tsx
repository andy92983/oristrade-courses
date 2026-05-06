"use client";

import { useEffect, useRef } from "react";

export function MarketOverview() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      dateRange: "12M",
      showChart: true,
      locale: "en",
      largeChartUrl: "",
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      width: "100%",
      height: "660",
      plotLineColorGrowing: "rgba(212, 175, 55, 1)",
      plotLineColorFalling: "rgba(255, 68, 68, 1)",
      gridLineColor: "rgba(37, 45, 69, 1)",
      scaleFontColor: "rgba(136, 146, 164, 1)",
      belowLineFillColorGrowing: "rgba(212, 175, 55, 0.12)",
      belowLineFillColorFalling: "rgba(255, 68, 68, 0.12)",
      belowLineFillColorGrowingBottom: "rgba(212, 175, 55, 0)",
      belowLineFillColorFallingBottom: "rgba(255, 68, 68, 0)",
      symbolActiveColor: "rgba(212, 175, 55, 0.15)",
      tabs: [
        {
          title: "Forex",
          symbols: [
            { s: "FX_IDC:EURUSD", d: "EUR/USD" },
            { s: "FX_IDC:GBPUSD", d: "GBP/USD" },
            { s: "FX_IDC:USDJPY", d: "USD/JPY" },
            { s: "FX_IDC:AUDUSD", d: "AUD/USD" },
            { s: "TVC:DXY", d: "Dollar Index" },
          ],
          originalTitle: "Forex",
        },
        {
          title: "Indices",
          /* FOREXCOM / TVC: symbols that load reliably in the free Market Overview embed (futures like CME_MINI:ES1! often show empty). */
          symbols: [
            { s: "FOREXCOM:SPXUSD", d: "S&P 500" },
            { s: "FOREXCOM:NSXUSD", d: "Nasdaq 100" },
            { s: "FOREXCOM:DJI", d: "Dow 30" },
            { s: "TVC:RUT", d: "Russell 2000" },
            { s: "TVC:VIX", d: "VIX" },
          ],
          originalTitle: "Indices",
        },
        {
          title: "Commodities",
          symbols: [
            { s: "OANDA:XAUUSD", d: "Gold" },
            { s: "OANDA:XAGUSD", d: "Silver" },
            { s: "TVC:USOIL", d: "WTI Crude Oil" },
            { s: "FOREXCOM:NATURALGAS", d: "Natural Gas" },
          ],
          originalTitle: "Commodities",
        },
        {
          title: "Crypto",
          symbols: [
            { s: "BINANCE:BTCUSDT", d: "Bitcoin" },
            { s: "BINANCE:ETHUSDT", d: "Ethereum" },
            { s: "BINANCE:SOLUSDT", d: "Solana" },
            { s: "BINANCE:BNBUSDT", d: "BNB" },
          ],
          originalTitle: "Crypto",
        },
      ],
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container rounded-xl overflow-hidden border border-brand-border" ref={containerRef}>
      <div className="tradingview-widget-container__widget" />
    </div>
  );
}
