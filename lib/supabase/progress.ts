import { supabase } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Broker = "tos" | "tos_roth" | "robinhood" | "rh_roth" | "webull" | "tastytrade";

export const BROKER_LABELS: Record<Broker, string> = {
  tos:        "ThinkorSwim",
  tos_roth:   "ThinkorSwim (Roth)",
  robinhood:  "Robinhood",
  rh_roth:    "Robinhood (Roth)",
  webull:     "Webull",
  tastytrade: "TastyTrade",
};

export const BROKER_RULES: Record<Broker, string> = {
  tos:        "Open 2 SPX Iron Condors 7 DTE 5 delta 10 wide wings every day and let them expire.",
  tos_roth:   "Open 2 SPX Iron Condors 7 DTE 5 delta 10 wide wings every day and let them expire.",
  robinhood:  "Open 2 SPY Iron Condors 11 DTE 5 delta 5 wide wings every day. Rotate every two days.",
  rh_roth:    "Open 2 SPY Iron Condors 11 DTE 5 delta 5 wide wings every day. Rotate every two days.",
  webull:     "Open one SPX Iron Condor 30 DTE 5 Delta 25 wings every day and forget. After 30 days, one will expire every day.",
  tastytrade: "Open 2 SPX Iron Condors 7 DTE 5 delta 10 wide wings every day and let them expire.",
};

export type RulesStatus = "Followed" | "Broken" | "Drawdown" | "Did not Follow" | "Broke";

export const RULES_STATUS_OPTIONS: RulesStatus[] = [
  "Followed", "Broken", "Drawdown", "Did not Follow", "Broke",
];

export interface ProgressEntry {
  id: string;
  broker: Broker;
  entry_date: string;
  account_value: number;
  growth: number | null;
  target: number | null;
  week_label: string | null;
  rules_status: string | null;
  comments: string | null;
  emotions: string | null;
  trade_notes: string | null;
  weekly_note: string | null;
  created_at: string;
  updated_at: string;
}

export type NewProgressEntry = Omit<ProgressEntry, "id" | "created_at" | "updated_at">;

export interface WeeklySummary {
  week_label: string;
  total_growth: number;
  days: number;
  days_followed: number;
  start_balance: number;
  end_balance: number;
  weekly_pct: number;
}

export interface BrokerStats {
  current_balance: number;
  total_growth: number;
  total_pct: number;
  best_day: number;
  worst_day: number;
  days_followed: number;
  total_days: number;
  win_rate: number;
  entry_balance: number;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getEntries(broker: Broker): Promise<ProgressEntry[]> {
  const { data, error } = await supabase
    .from("account_progress")
    .select("*")
    .eq("broker", broker)
    .order("entry_date", { ascending: true });
  if (error) throw error;
  return data as ProgressEntry[];
}

export async function createEntry(entry: NewProgressEntry): Promise<ProgressEntry> {
  const { data, error } = await supabase
    .from("account_progress")
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return data as ProgressEntry;
}

export async function updateEntry(id: string, updates: Partial<NewProgressEntry>): Promise<void> {
  const { error } = await supabase
    .from("account_progress")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from("account_progress")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ─── Stats helpers ─────────────────────────────────────────────────────────────

export function calcBrokerStats(entries: ProgressEntry[]): BrokerStats {
  if (entries.length === 0) {
    return { current_balance: 0, total_growth: 0, total_pct: 0, best_day: 0, worst_day: 0, days_followed: 0, total_days: 0, win_rate: 0, entry_balance: 0 };
  }
  const growthDays = entries.filter(e => e.growth !== null);
  const growths = growthDays.map(e => e.growth as number);
  const entry_balance = entries[0].account_value - (entries[0].growth ?? 0);
  const current_balance = entries[entries.length - 1].account_value;
  const total_growth = growths.reduce((a, b) => a + b, 0);
  const total_pct = entry_balance > 0 ? (total_growth / entry_balance) * 100 : 0;
  const best_day = growths.length ? Math.max(...growths) : 0;
  const worst_day = growths.length ? Math.min(...growths) : 0;
  const days_followed = entries.filter(e => e.rules_status === "Followed").length;
  const total_days = entries.length;
  const win_rate = total_days > 0 ? (days_followed / total_days) * 100 : 0;
  return { current_balance, total_growth, total_pct, best_day, worst_day, days_followed, total_days, win_rate, entry_balance };
}

export function calcWeeklySummary(entries: ProgressEntry[]): WeeklySummary[] {
  const byWeek: Record<string, ProgressEntry[]> = {};
  for (const e of entries) {
    const wk = e.week_label || "Unknown";
    if (!byWeek[wk]) byWeek[wk] = [];
    byWeek[wk].push(e);
  }
  return Object.entries(byWeek).map(([week_label, wkEntries]) => {
    const growths = wkEntries.map(e => e.growth ?? 0);
    const total_growth = growths.reduce((a, b) => a + b, 0);
    const start_balance = wkEntries[0].account_value - (wkEntries[0].growth ?? 0);
    const end_balance = wkEntries[wkEntries.length - 1].account_value;
    const weekly_pct = start_balance > 0 ? (total_growth / start_balance) * 100 : 0;
    const days_followed = wkEntries.filter(e => e.rules_status === "Followed").length;
    return { week_label, total_growth, days: wkEntries.length, days_followed, start_balance, end_balance, weekly_pct };
  });
}

// ─── Weekly Analytics (mirrors TOS/RH/WB/TT sub-sheets) ──────────────────────

export interface WeeklyAnalytics {
  week_label: string;
  total_growth: number;
  cumulative_growth: number;
  capital: number;
  weekly_pct: number;
  cumulative_pct: number;
  days: number;
  days_followed: number;
}

export function calcWeeklyAnalytics(entries: ProgressEntry[]): WeeklyAnalytics[] {
  if (entries.length === 0) return [];

  // Group by week preserving insertion order
  const weekOrder: string[] = [];
  const byWeek: Record<string, ProgressEntry[]> = {};
  for (const e of entries) {
    const wk = e.week_label || "Unknown";
    if (!byWeek[wk]) { byWeek[wk] = []; weekOrder.push(wk); }
    byWeek[wk].push(e);
  }

  const startingCapital = entries[0].account_value - (entries[0].growth ?? 0);
  let cumulative_growth = 0;

  return weekOrder.map(week_label => {
    const wkEntries = byWeek[week_label];
    const total_growth = wkEntries.reduce((sum, e) => sum + (e.growth ?? 0), 0);
    const prev_capital = startingCapital + cumulative_growth;
    cumulative_growth += total_growth;
    const capital = startingCapital + cumulative_growth;
    const weekly_pct = prev_capital > 0 ? (total_growth / prev_capital) * 100 : 0;
    const cumulative_pct = startingCapital > 0 ? (cumulative_growth / startingCapital) * 100 : 0;
    const days_followed = wkEntries.filter(e => e.rules_status === "Followed").length;
    return { week_label, total_growth, cumulative_growth, capital, weekly_pct, cumulative_pct, days: wkEntries.length, days_followed };
  });
}

// ─── Monthly Breakdown (mirrors Summary sheet monthly column) ─────────────────

export interface MonthlyBreakdown {
  month: string;       // e.g. "Jun 2025"
  month_key: string;   // e.g. "2025-06" for sorting
  total_growth: number;
  days: number;
  avg_daily: number;
}

export function calcMonthlyBreakdown(entries: ProgressEntry[]): MonthlyBreakdown[] {
  const byMonth: Record<string, ProgressEntry[]> = {};
  const monthOrder: string[] = [];

  for (const e of entries) {
    const key = e.entry_date.slice(0, 7); // YYYY-MM
    if (!byMonth[key]) { byMonth[key] = []; monthOrder.push(key); }
    byMonth[key].push(e);
  }

  return monthOrder.map(month_key => {
    const es = byMonth[month_key];
    const total_growth = es.reduce((sum, e) => sum + (e.growth ?? 0), 0);
    const days = es.length;
    const avg_daily = days > 0 ? total_growth / days : 0;
    const [year, mon] = month_key.split("-");
    const month = new Date(parseInt(year), parseInt(mon) - 1).toLocaleString("en-US", { month: "short", year: "numeric" });
    return { month, month_key, total_growth, days, avg_daily };
  });
}

// ─── Hypothetical Plan ────────────────────────────────────────────────────────

export interface HypotheticalWeek {
  week_label: string;
  projected: number;
  actual: number;
  difference: number;
  diff_pct: number;
}

export function calcHypothetical(
  entries: ProgressEntry[],
  weeklyTargetPct: number,   // e.g. 1.0 for 1%
  startingBalance?: number,
): HypotheticalWeek[] {
  if (entries.length === 0) return [];

  // Group by week
  const weekOrder: string[] = [];
  const byWeek: Record<string, ProgressEntry[]> = {};
  for (const e of entries) {
    const wk = e.week_label || "Unknown";
    if (!byWeek[wk]) { byWeek[wk] = []; weekOrder.push(wk); }
    byWeek[wk].push(e);
  }

  const base = startingBalance ?? (entries[0].account_value - (entries[0].growth ?? 0));
  let projected = base;

  return weekOrder.map(week_label => {
    projected = projected * (1 + weeklyTargetPct / 100);
    const wkEntries = byWeek[week_label];
    const actual = wkEntries[wkEntries.length - 1].account_value;
    const difference = actual - projected;
    const diff_pct = projected > 0 ? (difference / projected) * 100 : 0;
    return { week_label, projected, actual, difference, diff_pct };
  });
}
