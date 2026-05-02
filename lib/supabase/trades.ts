import { supabase } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TradeStatus   = "open" | "closed" | "expired" | "assigned" | "rolled";
export type TradeStrategy =
  | "bull_put_spread" | "bear_call_spread" | "iron_condor" | "iron_butterfly"
  | "naked_put" | "naked_call" | "covered_call" | "cash_secured_put"
  | "strangle" | "straddle" | "jade_lizard" | "big_lizard"
  | "ratio_spread" | "calendar_spread" | "long_stock" | "short_stock" | "other";

export interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  strategy: TradeStrategy;
  trade_date: string;
  expiration_date?: string;
  dte_at_entry?: number;
  short_strike?: number;
  long_strike?: number;
  spread_width?: number;
  contracts: number;
  premium_collected?: number;
  close_premium?: number;
  pnl?: number;
  pnl_pct?: number;
  max_risk?: number;
  max_profit?: number;
  iv_rank_entry?: number;
  iv_rank_exit?: number;
  delta_short?: number;
  pop_entry?: number;
  underlying_price_entry?: number;
  underlying_price_exit?: number;
  status: TradeStatus;
  close_date?: string;
  roll_count: number;
  setup_quality?: number;
  emotion_entry?: number;
  emotion_exit?: number;
  followed_plan: boolean;
  mistake: boolean;
  broker?: string;
  account?: string;
  tags?: string[];
  notes?: string;
  screenshot_url?: string;
  import_source?: string;
  broker_trade_id?: string;
  created_at: string;
  updated_at: string;
}

export type NewTrade = Omit<Trade, "id" | "user_id" | "created_at" | "updated_at" | "roll_count"> & {
  roll_count?: number;
};

// ─── Strategy labels ──────────────────────────────────────────────────────────

export const STRATEGY_LABELS: Record<TradeStrategy, string> = {
  bull_put_spread:   "Bull Put Spread",
  bear_call_spread:  "Bear Call Spread",
  iron_condor:       "Iron Condor",
  iron_butterfly:    "Iron Butterfly",
  naked_put:         "Naked Put",
  naked_call:        "Naked Call",
  covered_call:      "Covered Call",
  cash_secured_put:  "Cash-Secured Put",
  strangle:          "Strangle",
  straddle:          "Straddle",
  jade_lizard:       "Jade Lizard",
  big_lizard:        "Big Lizard",
  ratio_spread:      "Ratio Spread",
  calendar_spread:   "Calendar Spread",
  long_stock:        "Long Stock",
  short_stock:       "Short Stock",
  other:             "Other",
};

export const CREDIT_SPREADS: TradeStrategy[] = [
  "bull_put_spread", "bear_call_spread", "iron_condor", "iron_butterfly",
  "naked_put", "naked_call", "covered_call", "cash_secured_put",
  "strangle", "straddle", "jade_lizard", "big_lizard",
];

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getTrades(userId: string): Promise<Trade[]> {
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", userId)
    .order("trade_date", { ascending: false });
  if (error) { console.error("getTrades:", error); return []; }
  return data as Trade[];
}

export async function createTrade(trade: NewTrade, userId: string): Promise<{ data: Trade | null; error: any }> {
  const { data, error } = await supabase
    .from("trades")
    .insert({ ...trade, user_id: userId })
    .select()
    .single();
  return { data: data as Trade | null, error };
}

export async function updateTrade(id: string, updates: Partial<Trade>): Promise<{ error: any }> {
  const { error } = await supabase
    .from("trades")
    .update(updates)
    .eq("id", id);
  return { error };
}

export async function deleteTrade(id: string): Promise<{ error: any }> {
  const { error } = await supabase
    .from("trades")
    .delete()
    .eq("id", id);
  return { error };
}

// ─── Computed helpers ─────────────────────────────────────────────────────────

export function calcMaxRisk(trade: Partial<Trade>): number | undefined {
  if (!trade.spread_width || !trade.premium_collected || !trade.contracts) return undefined;
  return (trade.spread_width - trade.premium_collected) * 100 * trade.contracts;
}

export function calcMaxProfit(trade: Partial<Trade>): number | undefined {
  if (!trade.premium_collected || !trade.contracts) return undefined;
  return trade.premium_collected * 100 * trade.contracts;
}

export function calcPnl(trade: Partial<Trade>): number | undefined {
  if (trade.premium_collected == null || trade.close_premium == null || !trade.contracts) return undefined;
  return (trade.premium_collected - trade.close_premium) * 100 * trade.contracts;
}

export function calcPnlPct(pnl: number, maxRisk: number): number {
  if (maxRisk === 0) return 0;
  return Math.round((pnl / maxRisk) * 100 * 10) / 10;
}

// ─── Journal stats ────────────────────────────────────────────────────────────

export interface JournalStats {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  winners: number;
  losers: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
  avgPnlPct: number;
  avgDte: number;
  avgIvRank: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  bestSymbol: string;
}

export function calcStats(trades: Trade[]): JournalStats {
  const closed = trades.filter((t) => t.pnl != null);
  const winners = closed.filter((t) => (t.pnl ?? 0) > 0);
  const losers  = closed.filter((t) => (t.pnl ?? 0) < 0);

  const totalPnl    = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const grossProfit = winners.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const grossLoss   = Math.abs(losers.reduce((s, t) => s + (t.pnl ?? 0), 0));

  // Best symbol by total PnL
  const bySymbol: Record<string, number> = {};
  closed.forEach((t) => { bySymbol[t.symbol] = (bySymbol[t.symbol] ?? 0) + (t.pnl ?? 0); });
  const bestSymbol = Object.entries(bySymbol).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return {
    totalTrades:  trades.length,
    openTrades:   trades.filter((t) => t.status === "open").length,
    closedTrades: closed.length,
    winners:      winners.length,
    losers:       losers.length,
    winRate:      closed.length ? Math.round((winners.length / closed.length) * 1000) / 10 : 0,
    totalPnl:     Math.round(totalPnl * 100) / 100,
    avgPnl:       closed.length ? Math.round((totalPnl / closed.length) * 100) / 100 : 0,
    avgPnlPct:    closed.length ? Math.round(closed.reduce((s, t) => s + (t.pnl_pct ?? 0), 0) / closed.length * 10) / 10 : 0,
    avgDte:       trades.filter((t) => t.dte_at_entry).length
                    ? Math.round(trades.reduce((s, t) => s + (t.dte_at_entry ?? 0), 0) / trades.filter((t) => t.dte_at_entry).length)
                    : 0,
    avgIvRank:    trades.filter((t) => t.iv_rank_entry).length
                    ? Math.round(trades.reduce((s, t) => s + (t.iv_rank_entry ?? 0), 0) / trades.filter((t) => t.iv_rank_entry).length)
                    : 0,
    profitFactor: grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 100) / 100 : grossProfit > 0 ? 999 : 0,
    largestWin:   winners.length ? Math.max(...winners.map((t) => t.pnl ?? 0)) : 0,
    largestLoss:  losers.length  ? Math.min(...losers.map((t) => t.pnl ?? 0))  : 0,
    bestSymbol,
  };
}

// ─── CSV Import Parsers ───────────────────────────────────────────────────────

export function parseTastytradeCSV(csv: string, userId: string): Partial<NewTrade>[] {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const trades: Partial<NewTrade>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/"/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, j) => (row[h] = cols[j] ?? ""));

    if (!row["Symbol"] || row["Type"] !== "Trade") continue;

    const symbol   = row["Underlying Symbol"] || row["Symbol"];
    const pnl      = parseFloat(row["Value"]) || 0;
    const qty      = Math.abs(parseInt(row["Quantity"]) || 1);

    trades.push({
      symbol:          symbol.toUpperCase(),
      strategy:        "other",
      trade_date:      row["Date"]?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      contracts:       qty,
      pnl:             pnl,
      status:          "closed",
      broker:          "tastytrade",
      import_source:   "csv_tastytrade",
      broker_trade_id: row["Order #"] || undefined,
      notes:           row["Description"] || undefined,
    });
  }
  return trades;
}

export function parseThinkOrSwimCSV(csv: string): Partial<NewTrade>[] {
  // TOS format: Account Statement → Trade History section
  const lines = csv.trim().split("\n");
  const trades: Partial<NewTrade>[] = [];
  let inTradeSection = false;
  let headers: string[] = [];

  for (const line of lines) {
    if (line.includes("Account Trade History")) { inTradeSection = true; continue; }
    if (inTradeSection && line.startsWith("Exec Time")) {
      headers = line.split(",").map((h) => h.trim().replace(/"/g, ""));
      continue;
    }
    if (inTradeSection && headers.length && line.trim() && !line.startsWith(",,")) {
      const cols = line.split(",").map((c) => c.trim().replace(/"/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((h, j) => (row[h] = cols[j] ?? ""));

      if (!row["Symbol"]) continue;
      trades.push({
        symbol:        row["Symbol"]?.replace(/\s.*/,"").toUpperCase(),
        strategy:      "other",
        trade_date:    row["Exec Time"]?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        contracts:     Math.abs(parseInt(row["Qty"]) || 1),
        pnl:           parseFloat(row["Net Price"]) || undefined,
        status:        "closed",
        broker:        "thinkorswim",
        import_source: "csv_thinkorswim",
        notes:         row["Description"] || undefined,
      });
    }
  }
  return trades;
}

export function parseIBKRCSV(csv: string): Partial<NewTrade>[] {
  const lines = csv.trim().split("\n");
  const trades: Partial<NewTrade>[] = [];

  for (const line of lines) {
    if (!line.startsWith("Trades,Data,Order,Options")) continue;
    const cols = line.split(",").map((c) => c.trim().replace(/"/g, ""));
    // IBKR options columns: Symbol, Date/Time, Quantity, T. Price, Realized P&L
    trades.push({
      symbol:        cols[5]?.toUpperCase() || "UNKNOWN",
      strategy:      "other",
      trade_date:    cols[6]?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      contracts:     Math.abs(parseInt(cols[7]) || 1),
      pnl:           parseFloat(cols[12]) || undefined,
      status:        "closed",
      broker:        "ibkr",
      import_source: "csv_ibkr",
    });
  }
  return trades;
}

export function parseRobinhoodCSV(csv: string): Partial<NewTrade>[] {
  // Robinhood: Account → History → Export → options_transactions.csv
  // Columns: activity_date, process_date, settle_date, instrument, description, trans_code, quantity, price, amount
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const trades: Partial<NewTrade>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/"/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, j) => (row[h] = cols[j] ?? ""));

    // Only include options buy/sell transactions
    const code = row["trans_code"] || row["Trans Code"] || "";
    if (!["BTO","STO","BTC","STC"].includes(code.toUpperCase())) continue;

    const instrument = row["instrument"] || row["Instrument"] || row["description"] || row["Description"] || "";
    const symbol = instrument.split(" ")[0]?.toUpperCase() || "UNKNOWN";
    const qty = Math.abs(parseInt(row["quantity"] || row["Quantity"]) || 1);
    const amount = parseFloat((row["amount"] || row["Amount"] || "0").replace(/[$,]/g, "")) || 0;

    trades.push({
      symbol,
      strategy:      "other",
      trade_date:    row["activity_date"]?.slice(0, 10) || row["Activity Date"]?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      contracts:     qty,
      pnl:           amount || undefined,
      status:        "closed",
      broker:        "robinhood",
      import_source: "csv_robinhood",
      notes:         row["description"] || row["Description"] || undefined,
    });
  }
  return trades;
}

export function parseWebullCSV(csv: string): Partial<NewTrade>[] {
  // Webull: More → Account → History → Options → Export
  // Columns: Symbol, Type, Side, Qty, Price, Amount, Date, Status
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const trades: Partial<NewTrade>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/"/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, j) => (row[h] = cols[j] ?? ""));

    const type = row["Type"] || row["type"] || row["Instrument Type"] || "";
    if (!type.toLowerCase().includes("option") && !type.toLowerCase().includes("opt")) continue;

    const status = (row["Status"] || row["status"] || "").toLowerCase();
    if (status && !["filled", "cancelled_partially_filled"].includes(status) && status !== "filled") continue;

    const symbol = (row["Symbol"] || row["symbol"] || row["Ticker"] || "UNKNOWN").split(" ")[0].toUpperCase();
    const qty = Math.abs(parseInt(row["Qty"] || row["qty"] || row["Quantity"] || "1") || 1);
    const amount = parseFloat((row["Amount"] || row["amount"] || row["Net Amount"] || "0").replace(/[$,]/g, "")) || 0;

    trades.push({
      symbol,
      strategy:      "other",
      trade_date:    (row["Date"] || row["date"] || row["Time"] || new Date().toISOString()).slice(0, 10),
      contracts:     qty,
      pnl:           amount || undefined,
      status:        "closed",
      broker:        "webull",
      import_source: "csv_webull",
      notes:         row["Description"] || row["description"] || undefined,
    });
  }
  return trades;
}
