"use client";

import { useEffect, useState, useCallback } from "react";
import { AuthGuard } from "../../components/auth/AuthGuard";
import { useAuth } from "../../lib/supabase/useAuth";
import {
  getTrades, createTrade, updateTrade, deleteTrade, calcStats,
  parseTastytradeCSV, parseThinkOrSwimCSV, parseIBKRCSV, parseRobinhoodCSV, parseWebullCSV,
  STRATEGY_LABELS,
  type Trade, type NewTrade, type TradeStrategy, type JournalStats,
} from "../../lib/supabase/trades";

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = "text-white" }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="card">
      <div className="text-brand-muted text-xs font-semibold mb-1">{label}</div>
      <div className={`font-display font-bold text-2xl ${color}`}>{value}</div>
      {sub && <div className="text-brand-muted text-xs mt-1">{sub}</div>}
    </div>
  );
}

// ─── Trade Row ────────────────────────────────────────────────────────────────
function TradeRow({ trade, onEdit, onDelete }: {
  trade: Trade;
  onEdit: (t: Trade) => void;
  onDelete: (id: string) => void;
}) {
  const pnl     = trade.pnl ?? null;
  const pnlColor = pnl == null ? "text-brand-muted" : pnl >= 0 ? "text-brand-green" : "text-brand-red";
  const statusColors: Record<string, string> = {
    open:     "bg-blue-500/10 text-blue-400 border-blue-500/20",
    closed:   "bg-brand-card text-brand-muted border-brand-border",
    expired:  "bg-brand-green/10 text-brand-green border-brand-green/20",
    assigned: "bg-brand-red/10 text-brand-red border-brand-red/20",
    rolled:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };

  return (
    <tr className="border-b border-brand-border hover:bg-brand-card/50 transition-colors group">
      <td className="px-4 py-3 text-white font-bold">{trade.symbol}</td>
      <td className="px-4 py-3 text-brand-muted text-sm">{STRATEGY_LABELS[trade.strategy] ?? trade.strategy}</td>
      <td className="px-4 py-3 text-brand-muted text-sm">{trade.trade_date}</td>
      <td className="px-4 py-3 text-brand-muted text-sm">{trade.expiration_date ?? "—"}</td>
      <td className="px-4 py-3 text-brand-muted text-sm text-center">{trade.dte_at_entry ?? "—"}</td>
      <td className="px-4 py-3 text-brand-muted text-sm text-center">{trade.contracts}</td>
      <td className="px-4 py-3 text-brand-muted text-sm font-mono text-right">
        {trade.premium_collected != null ? `$${trade.premium_collected.toFixed(2)}` : "—"}
      </td>
      <td className={`px-4 py-3 font-mono font-bold text-right ${pnlColor}`}>
        {pnl != null ? `${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}` : "—"}
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColors[trade.status] ?? ""}`}>
          {trade.status.toUpperCase()}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(trade)} className="text-xs text-brand-gold hover:underline">Edit</button>
          <button onClick={() => onDelete(trade.id)} className="text-xs text-brand-red hover:underline">Del</button>
        </div>
      </td>
    </tr>
  );
}

// ─── Trade Form ───────────────────────────────────────────────────────────────
const BLANK: Partial<NewTrade> = {
  symbol: "", strategy: "bull_put_spread", trade_date: new Date().toISOString().slice(0, 10),
  contracts: 1, status: "open", followed_plan: true, mistake: false, roll_count: 0,
};

function TradeForm({ initial, onSave, onCancel }: {
  initial?: Partial<Trade>;
  onSave: (t: Partial<NewTrade>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<NewTrade>>({ ...BLANK, ...initial });
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const isCreditSpread = ["bull_put_spread","bear_call_spread","iron_condor","iron_butterfly",
    "naked_put","naked_call","covered_call","cash_secured_put","strangle","straddle",
    "jade_lizard","big_lizard"].includes(form.strategy ?? "");

  const maxRisk   = form.spread_width && form.premium_collected && form.contracts
    ? (form.spread_width - form.premium_collected) * 100 * form.contracts : null;
  const maxProfit = form.premium_collected && form.contracts
    ? form.premium_collected * 100 * form.contracts : null;

  const Input = ({ label, k, type = "text", ...rest }: any) => (
    <div>
      <label className="text-xs text-brand-muted block mb-1">{label}</label>
      <input
        type={type} value={(form as any)[k] ?? ""} step="any"
        onChange={(e) => set(k, type === "number" ? (e.target.value === "" ? undefined : parseFloat(e.target.value)) : e.target.value)}
        className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-gold/50"
        {...rest}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 pt-10 pb-10 overflow-y-auto">
      <div className="bg-brand-card border border-brand-border rounded-2xl p-6 w-full max-w-3xl mx-4">
        <h2 className="font-display font-bold text-white text-xl mb-6">
          {initial?.id ? "Edit Trade" : "Log New Trade"}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Input label="Symbol (underlying)" k="symbol" placeholder="SPY" />
          <div>
            <label className="text-xs text-brand-muted block mb-1">Strategy</label>
            <select value={form.strategy} onChange={(e) => set("strategy", e.target.value)}
              className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-gold/50">
              {(Object.keys(STRATEGY_LABELS) as TradeStrategy[]).map((s) => (
                <option key={s} value={s}>{STRATEGY_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-brand-muted block mb-1">Status</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)}
              className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-gold/50">
              {["open","closed","expired","assigned","rolled"].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <Input label="Trade Date" k="trade_date" type="date" />
          <Input label="Expiration Date" k="expiration_date" type="date" />
          <Input label="DTE at Entry" k="dte_at_entry" type="number" placeholder="45" />
        </div>

        {/* Options fields */}
        {isCreditSpread && (
          <>
            <div className="border-t border-brand-border pt-4 mb-4">
              <h3 className="text-brand-gold text-sm font-semibold mb-4">Options / Spread Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input label="Short Strike" k="short_strike" type="number" placeholder="500" />
                <Input label="Long Strike" k="long_strike" type="number" placeholder="495" />
                <Input label="Spread Width" k="spread_width" type="number" placeholder="5" />
                <Input label="Contracts" k="contracts" type="number" placeholder="1" />
              </div>
            </div>

            <div className="border-t border-brand-border pt-4 mb-4">
              <h3 className="text-brand-gold text-sm font-semibold mb-4">Premium & P&L</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input label="Premium Collected (per share)" k="premium_collected" type="number" placeholder="1.50" />
                <Input label="Close Premium (per share)" k="close_premium" type="number" placeholder="0.05" />
                <div className="text-sm">
                  <div className="text-xs text-brand-muted mb-1">Max Profit</div>
                  <div className="text-brand-green font-bold">{maxProfit != null ? `$${maxProfit.toFixed(0)}` : "—"}</div>
                </div>
                <div className="text-sm">
                  <div className="text-xs text-brand-muted mb-1">Max Risk</div>
                  <div className="text-brand-red font-bold">{maxRisk != null ? `$${maxRisk.toFixed(0)}` : "—"}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Greeks & context */}
        <div className="border-t border-brand-border pt-4 mb-4">
          <h3 className="text-brand-gold text-sm font-semibold mb-4">Greeks & Market Context</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input label="IV Rank at Entry" k="iv_rank_entry" type="number" placeholder="45" />
            <Input label="IV Rank at Exit" k="iv_rank_exit" type="number" placeholder="30" />
            <Input label="Short Strike Delta" k="delta_short" type="number" placeholder="-0.16" />
            <Input label="Prob. of Profit %" k="pop_entry" type="number" placeholder="72" />
            <Input label="Underlying at Entry" k="underlying_price_entry" type="number" placeholder="518.50" />
            <Input label="Underlying at Exit" k="underlying_price_exit" type="number" placeholder="521.00" />
            <div>
              <label className="text-xs text-brand-muted block mb-1">Broker</label>
              <select value={form.broker ?? ""} onChange={(e) => set("broker", e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-gold/50">
                <option value="">Select broker</option>
                {["tastytrade","thinkorswim","ibkr","webull","tradestation","other"].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-brand-muted block mb-1">Account Type</label>
              <select value={form.account ?? ""} onChange={(e) => set("account", e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-gold/50">
                <option value="">Select</option>
                {["personal","ira","prop_firm","paper"].map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Psychology */}
        <div className="border-t border-brand-border pt-4 mb-4">
          <h3 className="text-brand-gold text-sm font-semibold mb-4">Trade Quality & Psychology</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-brand-muted block mb-1">Setup Quality (1–5 ★)</label>
              <input type="range" min="1" max="5" value={form.setup_quality ?? 3}
                onChange={(e) => set("setup_quality", parseInt(e.target.value))}
                className="w-full accent-brand-gold" />
              <div className="text-brand-gold text-center text-sm">{"★".repeat(form.setup_quality ?? 3)}</div>
            </div>
            <div>
              <label className="text-xs text-brand-muted block mb-1">Confidence at Entry (1–10)</label>
              <input type="range" min="1" max="10" value={form.emotion_entry ?? 7}
                onChange={(e) => set("emotion_entry", parseInt(e.target.value))}
                className="w-full accent-brand-gold" />
              <div className="text-brand-muted text-center text-sm">{form.emotion_entry ?? 7}/10</div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <label className="flex items-center gap-2 text-sm text-brand-muted cursor-pointer">
                <input type="checkbox" checked={form.followed_plan} onChange={(e) => set("followed_plan", e.target.checked)}
                  className="accent-brand-green" />
                Followed my plan
              </label>
              <label className="flex items-center gap-2 text-sm text-brand-muted cursor-pointer">
                <input type="checkbox" checked={form.mistake} onChange={(e) => set("mistake", e.target.checked)}
                  className="accent-brand-red" />
                Mistake / lesson
              </label>
            </div>
            <Input label="Tags (comma separated)" k="tags_raw" placeholder="earnings, high-iv, wheel" />
          </div>
        </div>

        <div className="mb-6">
          <label className="text-xs text-brand-muted block mb-1">Notes</label>
          <textarea value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} rows={3}
            placeholder="Why did you take this trade? What did you learn?"
            className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-gold/50 resize-none" />
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-outline text-sm">Cancel</button>
          <button
            onClick={() => {
              const tags = (form as any).tags_raw
                ? (form as any).tags_raw.split(",").map((t: string) => t.trim()).filter(Boolean)
                : form.tags;
              // Auto-calculate P&L if closed
              let pnl = form.pnl;
              if (form.premium_collected != null && form.close_premium != null && form.contracts) {
                pnl = (form.premium_collected - form.close_premium) * 100 * form.contracts;
              }
              const maxR = form.spread_width && form.premium_collected && form.contracts
                ? (form.spread_width - form.premium_collected) * 100 * form.contracts : form.max_risk;
              const pnlPct = pnl != null && maxR ? Math.round((pnl / maxR) * 1000) / 10 : form.pnl_pct;
              onSave({ ...form, tags, pnl, pnl_pct: pnlPct, max_risk: maxR });
            }}
            className="btn-gold text-sm"
          >
            {initial?.id ? "Save Changes" : "Log Trade"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CSV Import Modal ─────────────────────────────────────────────────────────
function CsvImportModal({ onImport, onCancel }: {
  onImport: (trades: Partial<NewTrade>[]) => void;
  onCancel: () => void;
}) {
  const [broker, setBroker] = useState("tastytrade");
  const [preview, setPreview] = useState<Partial<NewTrade>[]>([]);
  const [error, setError] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const csv = ev.target?.result as string;
      try {
        let parsed: Partial<NewTrade>[] = [];
        if (broker === "tastytrade")    parsed = parseTastytradeCSV(csv, "");
        if (broker === "thinkorswim")   parsed = parseThinkOrSwimCSV(csv);
        if (broker === "ibkr")          parsed = parseIBKRCSV(csv);
        if (broker === "robinhood")     parsed = parseRobinhoodCSV(csv);
        if (broker === "webull")        parsed = parseWebullCSV(csv);
        if (parsed.length === 0) { setError("No trades found. Check you selected the right broker format."); return; }
        setPreview(parsed);
        setError("");
      } catch {
        setError("Could not parse the file. Make sure it's a valid CSV export from your broker.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-brand-card border border-brand-border rounded-2xl p-6 w-full max-w-lg mx-4">
        <h2 className="font-display font-bold text-white text-xl mb-2">Import from Broker CSV</h2>
        <p className="text-brand-muted text-sm mb-5">Export your trade history from your broker, then upload the CSV file here.</p>

        <div className="mb-4">
          <label className="text-xs text-brand-muted block mb-1">Broker Format</label>
          <select value={broker} onChange={(e) => setBroker(e.target.value)}
            className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-gold/50">
            <option value="tastytrade">Tastytrade — History → Transactions → Export CSV</option>
            <option value="thinkorswim">Think or Swim — Account Statement → Trade History</option>
            <option value="ibkr">IBKR — Reports → Flex Query → Options Trades</option>
            <option value="robinhood">Robinhood — Account → History → Export CSV</option>
            <option value="webull">Webull — More → Account → History → Options → Export</option>
          </select>
        </div>

        <div className="mb-4 border-2 border-dashed border-brand-border rounded-xl p-6 text-center">
          <input type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" id="csv-upload" />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <div className="text-3xl mb-2">📂</div>
            <div className="text-white font-medium text-sm">Click to select CSV file</div>
            <div className="text-brand-muted text-xs mt-1">or drag and drop</div>
          </label>
        </div>

        {error && <p className="text-brand-red text-sm mb-4">{error}</p>}

        {preview.length > 0 && (
          <div className="mb-4 bg-brand-bg rounded-xl p-4 border border-brand-border">
            <div className="text-brand-green text-sm font-semibold mb-2">✅ {preview.length} trades ready to import</div>
            <div className="text-brand-muted text-xs">
              Preview: {preview.slice(0, 3).map((t) => t.symbol).join(", ")}{preview.length > 3 ? "..." : ""}
            </div>
            <p className="text-xs text-yellow-400 mt-2">⚠️ Review each trade after import — auto-parsed fields may need manual adjustment for strategy and options details.</p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-outline text-sm">Cancel</button>
          <button
            disabled={preview.length === 0}
            onClick={() => onImport(preview)}
            className="btn-gold text-sm disabled:opacity-40"
          >
            Import {preview.length > 0 ? `${preview.length} Trades` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Journal Content ─────────────────────────────────────────────────────
function JournalContent() {
  const { user }                            = useAuth();
  const [trades, setTrades]                 = useState<Trade[]>([]);
  const [loading, setLoading]               = useState(true);
  const [showForm, setShowForm]             = useState(false);
  const [showImport, setShowImport]         = useState(false);
  const [editing, setEditing]               = useState<Trade | undefined>(undefined);
  const [filter, setFilter]                 = useState<"all" | "open" | "closed" | "expired">("all");
  const [strategyFilter, setStrategyFilter] = useState("all");
  const [symbolFilter, setSymbolFilter]     = useState("");
  const [msg, setMsg]                       = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const t = await getTrades(user.id);
    setTrades(t);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const handleSave = async (form: Partial<NewTrade>) => {
    if (!user) return;
    if (editing?.id) {
      const { error } = await updateTrade(editing.id, form as Partial<Trade>);
      if (!error) { flash("Trade updated ✓"); load(); }
    } else {
      const { error } = await createTrade(form as NewTrade, user.id);
      if (!error) { flash("Trade logged ✓"); load(); }
    }
    setShowForm(false);
    setEditing(undefined);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this trade?")) return;
    const { error } = await deleteTrade(id);
    if (!error) { flash("Trade deleted"); load(); }
  };

  const handleImport = async (imported: Partial<NewTrade>[]) => {
    if (!user) return;
    let count = 0;
    for (const t of imported) {
      const { error } = await createTrade(t as NewTrade, user.id);
      if (!error) count++;
    }
    flash(`${count} trades imported ✓`);
    setShowImport(false);
    load();
  };

  // Filters
  const filtered = trades.filter((t) => {
    if (filter !== "all" && t.status !== filter) return false;
    if (strategyFilter !== "all" && t.strategy !== strategyFilter) return false;
    if (symbolFilter && !t.symbol.toLowerCase().includes(symbolFilter.toLowerCase())) return false;
    return true;
  });

  const stats = calcStats(trades);

  const strategies = Array.from(new Set(trades.map((t) => t.strategy)));

  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-brand-gold text-xl">📒</span>
              <span className="text-brand-gold text-xs font-bold tracking-wide">TRADING JOURNAL</span>
            </div>
            <h1 className="font-display font-black text-3xl text-white">My Journal</h1>
            <p className="text-brand-muted text-sm mt-1">Credit spread & options trade tracking — powered by OrisTrade</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowImport(true)} className="btn-outline text-sm">
              📂 Import CSV
            </button>
            <button onClick={() => { setEditing(undefined); setShowForm(true); }} className="btn-gold text-sm">
              + Log Trade
            </button>
          </div>
        </div>

        {/* Flash message */}
        {msg && (
          <div className="mb-4 bg-brand-green/10 border border-brand-green/20 text-brand-green text-sm rounded-xl px-4 py-3">
            {msg}
          </div>
        )}

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard label="Total P&L"
            value={`${stats.totalPnl >= 0 ? "+" : ""}$${stats.totalPnl.toFixed(0)}`}
            color={stats.totalPnl >= 0 ? "text-brand-green" : "text-brand-red"} />
          <StatCard label="Win Rate" value={`${stats.winRate}%`}
            sub={`${stats.winners}W / ${stats.losers}L`}
            color={stats.winRate >= 65 ? "text-brand-green" : stats.winRate >= 50 ? "text-yellow-400" : "text-brand-red"} />
          <StatCard label="Profit Factor" value={stats.profitFactor}
            color={stats.profitFactor >= 1.5 ? "text-brand-green" : stats.profitFactor >= 1 ? "text-yellow-400" : "text-brand-red"} />
          <StatCard label="Avg P&L" value={`$${stats.avgPnl.toFixed(0)}`}
            sub={`${stats.avgPnlPct > 0 ? "+" : ""}${stats.avgPnlPct}% of risk`}
            color={stats.avgPnl >= 0 ? "text-brand-green" : "text-brand-red"} />
          <StatCard label="Avg DTE" value={stats.avgDte} sub="days to expiry" />
          <StatCard label="Avg IV Rank" value={stats.avgIvRank}
            sub={`Best: ${stats.bestSymbol}`} />
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-brand-muted text-xs mb-1">OPEN TRADES</div>
            <div className="text-blue-400 font-bold text-xl">{stats.openTrades}</div>
          </div>
          <div className="card text-center">
            <div className="text-brand-muted text-xs mb-1">CLOSED</div>
            <div className="text-white font-bold text-xl">{stats.closedTrades}</div>
          </div>
          <div className="card text-center">
            <div className="text-brand-muted text-xs mb-1">LARGEST WIN</div>
            <div className="text-brand-green font-bold text-xl">+${stats.largestWin.toFixed(0)}</div>
          </div>
          <div className="card text-center">
            <div className="text-brand-muted text-xs mb-1">LARGEST LOSS</div>
            <div className="text-brand-red font-bold text-xl">${stats.largestLoss.toFixed(0)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <div className="flex gap-2">
            {["all","open","closed","expired"].map((f) => (
              <button key={f} onClick={() => setFilter(f as any)}
                className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
                  filter === f ? "bg-brand-gold/10 text-brand-gold border-brand-gold/30" : "text-brand-muted border-brand-border hover:text-white"
                }`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          {strategies.length > 0 && (
            <select value={strategyFilter} onChange={(e) => setStrategyFilter(e.target.value)}
              className="bg-brand-bg border border-brand-border rounded-lg px-3 py-1.5 text-sm text-brand-muted focus:outline-none focus:border-brand-gold/50">
              <option value="all">All Strategies</option>
              {strategies.map((s) => <option key={s} value={s}>{STRATEGY_LABELS[s] ?? s}</option>)}
            </select>
          )}
          <input
            value={symbolFilter} onChange={(e) => setSymbolFilter(e.target.value)}
            placeholder="Filter by symbol…"
            className="bg-brand-bg border border-brand-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-gold/50 w-40"
          />
          <span className="text-brand-muted text-sm ml-auto">{filtered.length} trades</span>
        </div>

        {/* Trade Table */}
        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin mx-auto mb-4" />
              <p className="text-brand-muted text-sm">Loading trades…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📒</div>
              <h3 className="text-white font-bold text-lg mb-2">No trades yet</h3>
              <p className="text-brand-muted text-sm mb-6 max-w-sm mx-auto">
                Start logging your credit spreads and options trades to track your performance and find your edge.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setShowImport(true)} className="btn-outline text-sm">📂 Import from Broker</button>
                <button onClick={() => { setEditing(undefined); setShowForm(true); }} className="btn-gold text-sm">+ Log First Trade</button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border">
                    {["Symbol","Strategy","Date","Expiry","DTE","Qty","Premium","P&L","Status",""].map((h) => (
                      <th key={h} className="px-4 py-3 text-brand-muted text-xs font-semibold text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <TradeRow key={t.id} trade={t}
                      onEdit={(t) => { setEditing(t); setShowForm(true); }}
                      onDelete={handleDelete} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Broker import guide */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { broker: "Tastytrade", steps: "History → Transactions → select date range → Export CSV" },
            { broker: "Think or Swim", steps: "Monitor → Account Statement → Trade History → Export" },
            { broker: "IBKR", steps: "Reports → Flex Query → create query with Options Trades → Run" },
            { broker: "Robinhood", steps: "Account → History → select Options → Export CSV (options_transactions.csv)" },
            { broker: "Webull", steps: "More → Account → History → Options tab → Export to CSV" },
          ].map((b) => (
            <div key={b.broker} className="card border-brand-border/50">
              <div className="text-brand-gold font-semibold text-sm mb-1">{b.broker}</div>
              <p className="text-brand-muted text-xs leading-relaxed">{b.steps}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-brand-card/50 border border-brand-border rounded-xl px-5 py-4">
          <p className="text-brand-muted text-xs">
            <strong className="text-brand-muted">ℹ️ Coming in Phase 2:</strong> Live broker API connections (Tastytrade API, IBKR Flex Queries) will auto-sync trades without CSV export. Prop firm support (FTMO, TopStep, Apex) via CSV is available now.
          </p>
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <TradeForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(undefined); }}
        />
      )}
      {showImport && (
        <CsvImportModal onImport={handleImport} onCancel={() => setShowImport(false)} />
      )}
    </div>
  );
}

// ─── Export (wrapped in AuthGuard) ───────────────────────────────────────────
export default function JournalPage() {
  return (
    <AuthGuard>
      <JournalContent />
    </AuthGuard>
  );
}
