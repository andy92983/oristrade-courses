"use client";

export interface SymbolDef {
  key: string;       // KV key / ticker used in alerts e.g. "SPY"
  label: string;     // Display name e.g. "S&P 500"
  tvSymbol: string;  // TradingView symbol e.g. "AMEX:SPY"
  category: string;
}

export const SYMBOL_GROUPS: { label: string; symbols: SymbolDef[] }[] = [
  {
    label: "Indices",
    symbols: [
      { key: "SPY",  label: "S&P 500",     tvSymbol: "AMEX:SPY",          category: "index" },
      { key: "QQQ",  label: "Nasdaq 100",  tvSymbol: "NASDAQ:QQQ",        category: "index" },
      { key: "DIA",  label: "Dow Jones",   tvSymbol: "AMEX:DIA",          category: "index" },
      { key: "IWM",  label: "Russell 2000",tvSymbol: "AMEX:IWM",          category: "index" },
      { key: "VIX",  label: "VIX",         tvSymbol: "CBOE:VIX",          category: "index" },
    ],
  },
  {
    label: "Futures",
    symbols: [
      { key: "ES1!", label: "S&P Futures", tvSymbol: "CME_MINI:ES1!",     category: "futures" },
      { key: "NQ1!", label: "NQ Futures",  tvSymbol: "CME_MINI:NQ1!",     category: "futures" },
      { key: "GC1!", label: "Gold",        tvSymbol: "COMEX:GC1!",        category: "futures" },
      { key: "CL1!", label: "Oil",         tvSymbol: "NYMEX:CL1!",        category: "futures" },
    ],
  },
  {
    label: "Stocks",
    symbols: [
      { key: "AAPL",  label: "Apple",     tvSymbol: "NASDAQ:AAPL",        category: "stock" },
      { key: "MSFT",  label: "Microsoft", tvSymbol: "NASDAQ:MSFT",        category: "stock" },
      { key: "NVDA",  label: "NVIDIA",    tvSymbol: "NASDAQ:NVDA",        category: "stock" },
      { key: "AMZN",  label: "Amazon",    tvSymbol: "NASDAQ:AMZN",        category: "stock" },
      { key: "TSLA",  label: "Tesla",     tvSymbol: "NASDAQ:TSLA",        category: "stock" },
      { key: "META",  label: "Meta",      tvSymbol: "NASDAQ:META",        category: "stock" },
      { key: "GOOGL", label: "Alphabet",  tvSymbol: "NASDAQ:GOOGL",       category: "stock" },
    ],
  },
  {
    label: "Forex",
    symbols: [
      { key: "EURUSD", label: "EUR/USD", tvSymbol: "FX_IDC:EURUSD",       category: "forex" },
      { key: "GBPUSD", label: "GBP/USD", tvSymbol: "FX_IDC:GBPUSD",       category: "forex" },
      { key: "USDJPY", label: "USD/JPY", tvSymbol: "FX_IDC:USDJPY",       category: "forex" },
      { key: "AUDUSD", label: "AUD/USD", tvSymbol: "FX_IDC:AUDUSD",       category: "forex" },
    ],
  },
  {
    label: "Crypto",
    symbols: [
      { key: "BTCUSDT", label: "Bitcoin",  tvSymbol: "BINANCE:BTCUSDT",   category: "crypto" },
      { key: "ETHUSDT", label: "Ethereum", tvSymbol: "BINANCE:ETHUSDT",   category: "crypto" },
    ],
  },
];

// Flat list of all symbols
export const ALL_SYMBOLS: SymbolDef[] = SYMBOL_GROUPS.flatMap((g) => g.symbols);

interface SymbolSelectorProps {
  selected: SymbolDef;
  onSelect: (s: SymbolDef) => void;
  signals?: Record<string, { signal: string }>;
}

function SignalDot({ signal }: { signal?: string }) {
  if (!signal) return <span className="w-1.5 h-1.5 rounded-full bg-brand-border inline-block" />;
  const color =
    signal === "BUY"  ? "bg-brand-green" :
    signal === "SELL" ? "bg-brand-red" :
                        "bg-yellow-500";
  return <span className={`w-1.5 h-1.5 rounded-full ${color} animate-pulse inline-block`} />;
}

export function SymbolSelector({ selected, onSelect, signals = {} }: SymbolSelectorProps) {
  return (
    <div className="space-y-3">
      {SYMBOL_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="text-brand-muted text-xs font-semibold uppercase tracking-widest mb-2 px-1">
            {group.label}
          </div>
          <div className="flex flex-wrap gap-2">
            {group.symbols.map((sym) => {
              const isActive = selected.key === sym.key;
              const sig = signals[sym.key]?.signal;
              return (
                <button
                  key={sym.key}
                  onClick={() => onSelect(sym)}
                  className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-all duration-150 ${
                    isActive
                      ? "bg-brand-gold/10 text-brand-gold border-brand-gold/40 font-semibold"
                      : "text-brand-muted border-brand-border hover:text-white hover:border-brand-border/60"
                  }`}
                >
                  <SignalDot signal={sig} />
                  {sym.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
