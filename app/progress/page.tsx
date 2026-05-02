"use client";

import { useState, useEffect, useCallback } from "react";
import { AuthGuard } from "../../components/auth/AuthGuard";
import {
  getEntries, createEntry, updateEntry, deleteEntry,
  calcBrokerStats, calcWeeklySummary, calcWeeklyAnalytics,
  calcMonthlyBreakdown, calcHypothetical,
  BROKER_LABELS, BROKER_RULES, RULES_STATUS_OPTIONS,
  type Broker, type ProgressEntry, type NewProgressEntry,
} from "../../lib/supabase/progress";

// ─── Constants ────────────────────────────────────────────────────────────────

const BROKERS: Broker[]     = ["tos", "robinhood", "webull", "tastytrade"];
const ALL_BROKERS: Broker[] = ["tos", "tos_roth", "robinhood", "rh_roth", "webull", "tastytrade"];

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmt$(v: number | null | undefined, decimals = 0) {
  if (v == null) return "—";
  const abs = Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (v < 0 ? "-$" : "$") + abs;
}
function fmtPct(v: number, decimals = 2) {
  return (v >= 0 ? "+" : "") + v.toFixed(decimals) + "%";
}
function pctColor(v: number) { return v >= 0 ? "text-brand-green" : "text-brand-red"; }
function dollarColor(v: number | null | undefined) { return (v ?? 0) >= 0 ? "text-brand-green" : "text-brand-red"; }

function statusBadge(s: string | null) {
  if (!s) return null;
  const colors: Record<string, string> = {
    Followed:           "bg-green-900/40 text-brand-green border-green-800/50",
    Broken:             "bg-red-900/40 text-brand-red border-red-800/50",
    Drawdown:           "bg-yellow-900/40 text-yellow-400 border-yellow-800/50",
    "Did not Follow":   "bg-orange-900/40 text-orange-400 border-orange-800/50",
    Broke:              "bg-red-900/40 text-brand-red border-red-800/50",
  };
  const cls = colors[s] || "bg-brand-card text-brand-muted border-brand-border";
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}>{s}</span>;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, color = "text-white", small = false }: {
  label: string; value: string; color?: string; small?: boolean;
}) {
  return (
    <div className="card">
      <div className="text-brand-muted text-xs font-semibold mb-1">{label}</div>
      <div className={`font-display font-bold ${small ? "text-lg" : "text-2xl"} ${color}`}>{value}</div>
    </div>
  );
}

// ─── Entry Form Modal ─────────────────────────────────────────────────────────

const EMPTY_FORM: Omit<NewProgressEntry, "broker"> = {
  entry_date: new Date().toISOString().slice(0, 10),
  account_value: 0, growth: null, target: null,
  week_label: "", rules_status: null,
  comments: null, emotions: null, trade_notes: null, weekly_note: null,
};

function EntryFormModal({ broker, initialData, onSave, onCancel }: {
  broker: Broker;
  initialData?: Partial<ProgressEntry>;
  onSave: (data: Omit<NewProgressEntry, "broker">) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Omit<NewProgressEntry, "broker">>({
    ...EMPTY_FORM,
    ...(initialData ? {
      entry_date:    initialData.entry_date    ?? EMPTY_FORM.entry_date,
      account_value: initialData.account_value ?? 0,
      growth:        initialData.growth        ?? null,
      target:        initialData.target        ?? null,
      week_label:    initialData.week_label    ?? "",
      rules_status:  initialData.rules_status  ?? null,
      comments:      initialData.comments      ?? null,
      emotions:      initialData.emotions      ?? null,
      trade_notes:   initialData.trade_notes   ?? null,
      weekly_note:   initialData.weekly_note   ?? null,
    } : {}),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const set = (k: keyof typeof form, v: string | number | null) =>
    setForm(f => ({ ...f, [k]: v === "" ? null : v }));

  const handleSave = async () => {
    if (!form.entry_date || !form.account_value) { setError("Date and Account Value are required."); return; }
    setSaving(true);
    try { await onSave(form); } catch (e: unknown) { setError(String(e)); setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-card border border-brand-border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="font-display font-bold text-white text-xl mb-5">
          {initialData ? "Edit Entry" : `Add Entry — ${BROKER_LABELS[broker]}`}
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[
            { label: "Date *",           key: "entry_date",    type: "date"   },
            { label: "Account Value *",  key: "account_value", type: "number", placeholder: "e.g. 25303" },
            { label: "Daily P&L",        key: "growth",        type: "number", placeholder: "e.g. 248 or -312" },
            { label: "Daily Target",     key: "target",        type: "number", placeholder: "e.g. 250" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-brand-muted block mb-1">{label}</label>
              <input type={type} placeholder={placeholder}
                value={key === "entry_date" ? form.entry_date : (form[key as keyof typeof form] ?? "")}
                step={type === "number" ? "0.01" : undefined}
                onChange={e => {
                  const raw = e.target.value;
                  set(key as keyof typeof form,
                    type === "number" ? (raw === "" ? null : parseFloat(raw)) : raw
                  );
                }}
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-gold/50" />
            </div>
          ))}
          <div>
            <label className="text-xs text-brand-muted block mb-1">Week Label</label>
            <input type="text" value={form.week_label ?? ""}
              onChange={e => set("week_label", e.target.value)}
              placeholder="e.g. Week 12"
              className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-gold/50" />
          </div>
          <div>
            <label className="text-xs text-brand-muted block mb-1">Rules Status</label>
            <select value={form.rules_status ?? ""}
              onChange={e => set("rules_status", e.target.value)}
              className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-gold/50">
              <option value="">— Select —</option>
              {RULES_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-3 mb-4">
          {[
            { label: "Comments",    key: "comments",    placeholder: "What happened today?" },
            { label: "Emotions",    key: "emotions",    placeholder: "How did you feel?" },
            { label: "Trade Notes", key: "trade_notes", placeholder: "Specific trade details" },
            { label: "Weekly Note", key: "weekly_note", placeholder: "End-of-week reflection" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-brand-muted block mb-1">{label}</label>
              <textarea value={(form[key as keyof typeof form] as string) ?? ""} rows={2}
                onChange={e => set(key as keyof typeof form, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-gold/50 resize-none" />
            </div>
          ))}
        </div>
        {error && <p className="text-brand-red text-sm mb-4">{error}</p>}
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-brand-muted hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-gold text-sm px-6 py-2 disabled:opacity-50">
            {saving ? "Saving…" : "Save Entry"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Daily Log Table ──────────────────────────────────────────────────────────

function DailyTable({ entries, onEdit, onDelete }: {
  entries: ProgressEntry[];
  onEdit: (e: ProgressEntry) => void;
  onDelete: (id: string) => void;
}) {
  const sorted = [...entries].reverse();
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-border text-brand-muted text-xs">
            {["Date","Week","Balance","P&L","Target","Status","Comments","Emotions","Trade",""].map((h, i) => (
              <th key={i} className={`py-2 ${i < 2 ? "text-left pr-3" : i < 5 ? "text-right px-2" : i < 9 ? "text-left px-3" : ""}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(e => (
            <tr key={e.id} className="border-b border-brand-border/30 hover:bg-brand-card/50 group">
              <td className="py-2 pr-3 text-white whitespace-nowrap">{e.entry_date}</td>
              <td className="py-2 pr-3 text-brand-muted text-xs">{e.week_label || "—"}</td>
              <td className="py-2 px-2 text-right text-white font-medium">{fmt$(e.account_value)}</td>
              <td className={`py-2 px-2 text-right font-medium ${dollarColor(e.growth)}`}>{fmt$(e.growth)}</td>
              <td className="py-2 px-2 text-right text-brand-muted">{fmt$(e.target)}</td>
              <td className="py-2 px-3">{statusBadge(e.rules_status)}</td>
              <td className="py-2 px-3 text-brand-muted text-xs max-w-[150px] truncate" title={e.comments ?? ""}>{e.comments || "—"}</td>
              <td className="py-2 px-3 text-brand-muted text-xs max-w-[120px] truncate" title={e.emotions ?? ""}>{e.emotions || "—"}</td>
              <td className="py-2 px-3 text-brand-muted text-xs max-w-[130px] truncate" title={e.trade_notes ?? ""}>{e.trade_notes || "—"}</td>
              <td className="py-2 pl-2">
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(e)} className="text-brand-gold text-xs hover:text-yellow-300">Edit</button>
                  <button onClick={() => onDelete(e.id)} className="text-brand-red text-xs hover:text-red-300">Del</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && <div className="text-center py-10 text-brand-muted">No entries yet.</div>}
    </div>
  );
}

// ─── Weekly Summary Table ─────────────────────────────────────────────────────

function WeeklyTable({ entries }: { entries: ProgressEntry[] }) {
  const weeks = calcWeeklySummary(entries);
  if (!weeks.length) return <div className="text-center py-10 text-brand-muted">No data yet.</div>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-brand-border text-brand-muted text-xs">
          {["Week","Days","Followed","Total P&L","Week %","End Balance"].map((h,i) => (
            <th key={i} className={`py-2 ${i===0?"text-left pr-4":"text-right px-3"}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map(w => (
          <tr key={w.week_label} className="border-b border-brand-border/30 hover:bg-brand-card/50">
            <td className="py-2 pr-4 text-white font-medium">{w.week_label}</td>
            <td className="py-2 px-3 text-right text-brand-muted">{w.days}</td>
            <td className={`py-2 px-3 text-right ${w.days_followed===w.days?"text-brand-green":"text-yellow-400"}`}>{w.days_followed}/{w.days}</td>
            <td className={`py-2 px-3 text-right font-medium ${dollarColor(w.total_growth)}`}>{fmt$(w.total_growth)}</td>
            <td className={`py-2 px-3 text-right ${pctColor(w.weekly_pct)}`}>{fmtPct(w.weekly_pct)}</td>
            <td className="py-2 px-3 text-right text-white">{fmt$(w.end_balance)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Analytics Table (mirrors TOS/RH/WB/TT sub-sheets) ───────────────────────

function AnalyticsTable({ entries }: { entries: ProgressEntry[] }) {
  const rows = calcWeeklyAnalytics(entries);
  if (!rows.length) return <div className="text-center py-10 text-brand-muted">No data yet.</div>;
  return (
    <div>
      <p className="text-brand-muted text-xs mb-3">
        Mirrors the per-broker analytics sheets — cumulative growth compounds automatically as you add daily entries.
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-border text-brand-muted text-xs">
            {["Week","Days","Followed","Total Growth","Cumul. Growth","Capital","Week %","Cumul. %"].map((h,i) => (
              <th key={i} className={`py-2 ${i===0?"text-left pr-4":"text-right px-3"}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.week_label} className="border-b border-brand-border/30 hover:bg-brand-card/50">
              <td className="py-2 pr-4 text-white font-medium">{r.week_label}</td>
              <td className="py-2 px-3 text-right text-brand-muted">{r.days}</td>
              <td className={`py-2 px-3 text-right ${r.days_followed===r.days?"text-brand-green":"text-yellow-400"}`}>{r.days_followed}/{r.days}</td>
              <td className={`py-2 px-3 text-right font-medium ${dollarColor(r.total_growth)}`}>{fmt$(r.total_growth)}</td>
              <td className={`py-2 px-3 text-right font-medium ${dollarColor(r.cumulative_growth)}`}>{fmt$(r.cumulative_growth)}</td>
              <td className="py-2 px-3 text-right text-brand-gold font-semibold">{fmt$(r.capital)}</td>
              <td className={`py-2 px-3 text-right ${pctColor(r.weekly_pct)}`}>{fmtPct(r.weekly_pct)}</td>
              <td className={`py-2 px-3 text-right font-semibold ${pctColor(r.cumulative_pct)}`}>{fmtPct(r.cumulative_pct)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Broker Tab ───────────────────────────────────────────────────────────────

type BrokerView = "daily" | "weekly" | "analytics";

function BrokerTab({ broker }: { broker: Broker }) {
  const [entries, setEntries]     = useState<ProgressEntry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editEntry, setEditEntry] = useState<ProgressEntry | null>(null);
  const [view, setView]           = useState<BrokerView>("daily");

  const load = useCallback(async () => {
    setLoading(true);
    try { setEntries(await getEntries(broker)); } catch { /* silent */ }
    setLoading(false);
  }, [broker]);

  useEffect(() => { load(); }, [load]);

  const stats = calcBrokerStats(entries);

  const handleSave = async (data: Omit<NewProgressEntry, "broker">) => {
    if (editEntry) await updateEntry(editEntry.id, data);
    else await createEntry({ ...data, broker });
    setShowForm(false); setEditEntry(null);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    await deleteEntry(id); await load();
  };

  return (
    <div>
      {/* Rule banner */}
      <div className="bg-brand-card/60 border border-brand-border rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
        <span className="text-brand-gold text-sm mt-0.5">📋</span>
        <p className="text-brand-muted text-sm"><strong className="text-white">Rule:</strong> {BROKER_RULES[broker]}</p>
      </div>

      {/* Stats row */}
      {loading
        ? <div className="h-20 flex items-center justify-center text-brand-muted text-sm">Loading…</div>
        : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-5">
            <StatCard label="Current Balance" value={fmt$(stats.current_balance)} color="text-brand-gold" small />
            <StatCard label="Total P&L" value={fmt$(stats.total_growth)} color={dollarColor(stats.total_growth)} small />
            <StatCard label="Total Return" value={fmtPct(stats.total_pct)} color={pctColor(stats.total_pct)} small />
            <StatCard label="Starting Balance" value={fmt$(stats.entry_balance)} color="text-brand-muted" small />
            <StatCard label="Best Day" value={fmt$(stats.best_day)} color="text-brand-green" small />
            <StatCard label="Worst Day" value={fmt$(stats.worst_day)} color="text-brand-red" small />
            <StatCard label="Days Followed" value={`${stats.days_followed}/${stats.total_days}`} small />
            <StatCard label="Discipline" value={`${stats.win_rate.toFixed(0)}%`}
              color={stats.win_rate >= 70 ? "text-brand-green" : stats.win_rate >= 50 ? "text-yellow-400" : "text-brand-red"} small />
          </div>
        )
      }

      {/* View toggle + Add */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-brand-card rounded-xl p-1 border border-brand-border">
          {([["daily","Daily Log"],["weekly","Weekly Summary"],["analytics","📊 Analytics"]] as [BrokerView,string][]).map(([v, label]) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view===v?"bg-brand-gold text-brand-bg":"text-brand-muted hover:text-white"}`}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => { setEditEntry(null); setShowForm(true); }} className="btn-gold text-sm px-4 py-2">
          + Add Entry
        </button>
      </div>

      {/* Table */}
      <div className="card">
        {!loading && (
          view === "daily"    ? <DailyTable entries={entries} onEdit={e => { setEditEntry(e); setShowForm(true); }} onDelete={handleDelete} /> :
          view === "weekly"   ? <WeeklyTable entries={entries} /> :
                                <AnalyticsTable entries={entries} />
        )}
      </div>

      {showForm && (
        <EntryFormModal broker={broker} initialData={editEntry ?? undefined}
          onSave={handleSave} onCancel={() => { setShowForm(false); setEditEntry(null); }} />
      )}
    </div>
  );
}

// ─── Hypothetical Plan Tab ────────────────────────────────────────────────────

function HypotheticalTab() {
  const [allEntries, setAllEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [weeklyPct, setWeeklyPct]   = useState(1.0); // default 1% weekly target

  useEffect(() => {
    Promise.all(ALL_BROKERS.map(b => getEntries(b))).then(results => {
      const merged: ProgressEntry[] = results.flat().sort((a, b) =>
        a.entry_date.localeCompare(b.entry_date));
      setAllEntries(merged);
      setLoading(false);
    });
  }, []);

  const rows = [...calcHypothetical(allEntries, weeklyPct)].reverse(); // latest week first
  const lastRow = rows[0]; // rows are descending — first row is the most recent week
  const ahead = lastRow ? lastRow.actual > lastRow.projected : false;

  return (
    <div>
      <div className="flex items-end gap-6 mb-6">
        <div>
          <label className="text-xs text-brand-muted block mb-1">Weekly Target Growth %</label>
          <div className="flex items-center gap-2">
            <input type="number" step="0.1" min="0.1" max="20" value={weeklyPct}
              onChange={e => setWeeklyPct(parseFloat(e.target.value) || 1)}
              className="w-28 bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-gold/50" />
            <span className="text-brand-muted text-sm">% per week</span>
          </div>
        </div>
        {lastRow && (
          <div className={`px-4 py-2 rounded-xl border text-sm font-semibold ${ahead ? "bg-green-900/30 border-green-800/50 text-brand-green" : "bg-red-900/30 border-red-800/50 text-brand-red"}`}>
            {ahead ? "✅ Ahead of plan" : "⚠️ Behind plan"} by {fmt$(Math.abs(lastRow.difference))}
          </div>
        )}
      </div>

      {loading
        ? <div className="text-center py-10 text-brand-muted">Loading…</div>
        : (
          <div className="card overflow-x-auto">
            <p className="text-brand-muted text-xs mb-4">
              Projected balance compounds at <strong className="text-white">{weeklyPct}%</strong> per week from starting capital.
              Actual balance is the combined end-of-week value across all accounts. Updates automatically as you add entries.
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-brand-muted text-xs">
                  {["Week","Projected Balance","Actual Balance","Difference","Diff %","Status"].map((h,i) => (
                    <th key={i} className={`py-2 ${i===0?"text-left pr-4":"text-right px-3"} ${i===5?"text-center":""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.week_label} className="border-b border-brand-border/30 hover:bg-brand-card/50">
                    <td className="py-2 pr-4 text-white font-medium">{r.week_label}</td>
                    <td className="py-2 px-3 text-right text-brand-muted">{fmt$(r.projected, 2)}</td>
                    <td className="py-2 px-3 text-right text-white font-semibold">{fmt$(r.actual)}</td>
                    <td className={`py-2 px-3 text-right font-medium ${dollarColor(r.difference)}`}>{fmt$(r.difference)}</td>
                    <td className={`py-2 px-3 text-right ${pctColor(r.diff_pct)}`}>{fmtPct(r.diff_pct)}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${r.difference >= 0
                        ? "bg-green-900/40 text-brand-green border-green-800/50"
                        : "bg-red-900/40 text-brand-red border-red-800/50"}`}>
                        {r.difference >= 0 ? "On Track" : "Behind"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && <div className="text-center py-8 text-brand-muted">No entries yet.</div>}
          </div>
        )
      }
    </div>
  );
}

// ─── Summary Tab ──────────────────────────────────────────────────────────────

function SummaryTab() {
  const [allData, setAllData]   = useState<Record<Broker, ProgressEntry[]>>(
    ALL_BROKERS.reduce((acc, b) => ({ ...acc, [b]: [] }), {} as Record<Broker, ProgressEntry[]>)
  );
  const [loading, setLoading]   = useState(true);
  const [subView, setSubView]   = useState<"overview" | "weekly" | "monthly">("overview");

  useEffect(() => {
    Promise.all(ALL_BROKERS.map(b => getEntries(b))).then(results => {
      const data = {} as Record<Broker, ProgressEntry[]>;
      ALL_BROKERS.forEach((b, i) => { data[b] = results[i]; });
      setAllData(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-10 text-brand-muted">Loading…</div>;

  const stats = ALL_BROKERS.reduce((acc, b) => { acc[b] = calcBrokerStats(allData[b]); return acc; }, {} as Record<Broker, ReturnType<typeof calcBrokerStats>>);

  // For overview table: show 4 rows (main brokers) with Roth merged into TOS and RH
  const overviewRows = BROKERS.map(b => {
    const s = stats[b];
    const rothKey = b === "tos" ? "tos_roth" : b === "robinhood" ? "rh_roth" : null;
    const sr = rothKey ? stats[rothKey] : null;
    return {
      broker: b,
      label: BROKER_LABELS[b],
      balance:  s.current_balance  + (sr ? sr.current_balance  : 0),
      growth:   s.total_growth     + (sr ? sr.total_growth     : 0),
      starting: s.entry_balance    + (sr ? sr.entry_balance    : 0),
      best_day: s.best_day,
      worst_day: s.worst_day,
      win_rate: s.win_rate,
      hasRoth: !!sr && sr.current_balance > 0,
    };
  });

  const totalBalance  = overviewRows.reduce((s, r) => s + r.balance, 0);
  const totalGrowth   = overviewRows.reduce((s, r) => s + r.growth, 0);
  const totalStarting = overviewRows.reduce((s, r) => s + r.starting, 0);
  const totalPct      = totalStarting > 0 ? (totalGrowth / totalStarting) * 100 : 0;

  // Combined entries for weekly/monthly views — include all 6 brokers
  const allEntries = ALL_BROKERS.flatMap(b => allData[b]).sort((a, b) => a.entry_date.localeCompare(b.entry_date));
  const monthlyRows = calcMonthlyBreakdown(allEntries);
  const weeklyAnalytics = calcWeeklyAnalytics(allEntries);

  return (
    <div>
      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Portfolio" value={fmt$(totalBalance)} color="text-brand-gold" />
        <StatCard label="Total P&L" value={fmt$(totalGrowth)} color={dollarColor(totalGrowth)} />
        <StatCard label="Overall Return" value={fmtPct(totalPct)} color={pctColor(totalPct)} />
        <StatCard label="Starting Capital" value={fmt$(totalStarting)} color="text-brand-muted" />
      </div>

      {/* Sub-view toggle */}
      <div className="flex gap-1 bg-brand-card rounded-xl p-1 border border-brand-border mb-5 w-fit">
        {([["overview","Account Breakdown"],["weekly","📊 Weekly Analytics"],["monthly","📅 Monthly P&L"]] as ["overview"|"weekly"|"monthly", string][]).map(([v, label]) => (
          <button key={v} onClick={() => setSubView(v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${subView===v?"bg-brand-gold text-brand-bg":"text-brand-muted hover:text-white"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Overview: 4-row table with Roth merged into TOS and RH */}
      {subView === "overview" && (
        <div className="card overflow-x-auto">
          <p className="text-brand-muted text-xs mb-3">Roth IRA balances are included in ThinkorSwim and Robinhood totals.</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-brand-muted text-xs">
                {["Account","Balance (incl. Roth)","Total P&L","Return %","Best Day","Worst Day","Discipline"].map((h,i) => (
                  <th key={i} className={`py-2 ${i===0?"text-left pr-4":"text-right px-3"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {overviewRows.map(r => {
                const retPct = r.starting > 0 ? (r.growth / r.starting) * 100 : 0;
                return (
                  <tr key={r.broker} className="border-b border-brand-border/30 hover:bg-brand-card/50">
                    <td className="py-3 pr-4 font-semibold">
                      <span className="text-white">{r.label}</span>
                      {r.hasRoth && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-brand-gold/20 text-brand-gold border border-brand-gold/30">+Roth</span>}
                    </td>
                    <td className="py-3 px-3 text-right text-brand-gold font-bold">{fmt$(r.balance)}</td>
                    <td className={`py-3 px-3 text-right font-medium ${dollarColor(r.growth)}`}>{fmt$(r.growth)}</td>
                    <td className={`py-3 px-3 text-right ${pctColor(retPct)}`}>{fmtPct(retPct)}</td>
                    <td className="py-3 px-3 text-right text-brand-green">{fmt$(r.best_day)}</td>
                    <td className="py-3 px-3 text-right text-brand-red">{fmt$(r.worst_day)}</td>
                    <td className={`py-3 px-3 text-right ${r.win_rate>=70?"text-brand-green":r.win_rate>=50?"text-yellow-400":"text-brand-red"}`}>{r.win_rate.toFixed(0)}%</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-brand-border/60">
                <td className="py-3 pr-4 text-white font-bold">TOTAL</td>
                <td className="py-3 px-3 text-right text-brand-gold font-bold">{fmt$(totalBalance)}</td>
                <td className={`py-3 px-3 text-right font-bold ${dollarColor(totalGrowth)}`}>{fmt$(totalGrowth)}</td>
                <td className={`py-3 px-3 text-right font-bold ${pctColor(totalPct)}`}>{fmtPct(totalPct)}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Weekly Analytics: combined across all brokers */}
      {subView === "weekly" && (
        <div className="card overflow-x-auto">
          <p className="text-brand-muted text-xs mb-4">
            Combined weekly analytics across all 4 accounts — mirrors the Summary sheet formulas.
            Cumulative growth and capital update automatically as you add entries.
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-brand-muted text-xs">
                {["Week","Total Growth","Cumul. Growth","Capital","Week %","Cumul. %"].map((h,i) => (
                  <th key={i} className={`py-2 ${i===0?"text-left pr-4":"text-right px-3"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeklyAnalytics.map(r => (
                <tr key={r.week_label} className="border-b border-brand-border/30 hover:bg-brand-card/50">
                  <td className="py-2 pr-4 text-white font-medium">{r.week_label}</td>
                  <td className={`py-2 px-3 text-right font-medium ${dollarColor(r.total_growth)}`}>{fmt$(r.total_growth)}</td>
                  <td className={`py-2 px-3 text-right font-medium ${dollarColor(r.cumulative_growth)}`}>{fmt$(r.cumulative_growth)}</td>
                  <td className="py-2 px-3 text-right text-brand-gold font-semibold">{fmt$(r.capital)}</td>
                  <td className={`py-2 px-3 text-right ${pctColor(r.weekly_pct)}`}>{fmtPct(r.weekly_pct)}</td>
                  <td className={`py-2 px-3 text-right font-semibold ${pctColor(r.cumulative_pct)}`}>{fmtPct(r.cumulative_pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Monthly P&L: mirrors the monthly column in Summary sheet */}
      {subView === "monthly" && (
        <div className="card overflow-x-auto">
          <p className="text-brand-muted text-xs mb-4">
            Monthly P&L across all accounts — mirrors the monthly averages column in your Summary sheet.
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-brand-muted text-xs">
                {["Month","Total P&L","Trading Days","Avg Daily",""].map((h,i) => (
                  <th key={i} className={`py-2 ${i===0?"text-left pr-4":"text-right px-3"} ${i===4?"w-8":""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyRows.map(r => (
                <tr key={r.month_key} className="border-b border-brand-border/30 hover:bg-brand-card/50">
                  <td className="py-3 pr-4 text-white font-semibold">{r.month}</td>
                  <td className={`py-3 px-3 text-right text-xl font-bold ${dollarColor(r.total_growth)}`}>{fmt$(r.total_growth)}</td>
                  <td className="py-3 px-3 text-right text-brand-muted">{r.days}</td>
                  <td className={`py-3 px-3 text-right ${dollarColor(r.avg_daily)}`}>{fmt$(r.avg_daily, 0)}/day</td>
                  <td className="py-3 px-1">
                    <div className={`w-2 h-2 rounded-full ${r.total_growth >= 0 ? "bg-brand-green" : "bg-brand-red"}`} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-brand-border/60">
                <td className="py-3 pr-4 text-white font-bold">ALL TIME</td>
                <td className={`py-3 px-3 text-right text-xl font-bold ${dollarColor(monthlyRows.reduce((s,r)=>s+r.total_growth,0))}`}>
                  {fmt$(monthlyRows.reduce((s,r)=>s+r.total_growth,0))}
                </td>
                <td className="py-3 px-3 text-right text-brand-muted">{monthlyRows.reduce((s,r)=>s+r.days,0)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type MainTab = Broker | "summary" | "hypothetical";

const TABS: { key: MainTab; label: string }[] = [
  { key: "tos",          label: "ThinkorSwim"        },
  { key: "tos_roth",     label: "ThinkorSwim (Roth)" },
  { key: "robinhood",    label: "Robinhood"           },
  { key: "rh_roth",      label: "Robinhood (Roth)"   },
  { key: "webull",       label: "Webull"              },
  { key: "tastytrade",   label: "TastyTrade"          },
  { key: "summary",      label: "📊 Summary"          },
  { key: "hypothetical", label: "🎯 Plan"             },
];

function ProgressContent() {
  const [activeTab, setActiveTab] = useState<MainTab>("tos");

  return (
    <div className="min-h-screen bg-brand-bg pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display font-black text-3xl text-white mb-1">
            Account <span className="text-gradient-gold">Growth Tracker</span>
          </h1>
          <p className="text-brand-muted text-sm">
            Private admin view — all calculations update automatically when you add or edit entries.
          </p>
        </div>

        {/* Main tabs */}
        <div className="flex gap-1 bg-brand-card rounded-2xl p-1 border border-brand-border mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === t.key ? "bg-brand-gold text-brand-bg font-bold" : "text-brand-muted hover:text-white"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "summary"      && <SummaryTab />}
        {activeTab === "hypothetical" && <HypotheticalTab />}
        {ALL_BROKERS.includes(activeTab as Broker) && (
          <BrokerTab key={activeTab} broker={activeTab as Broker} />
        )}
      </div>
    </div>
  );
}

export default function ProgressPage() {
  return (
    <AuthGuard requireAdmin>
      <ProgressContent />
    </AuthGuard>
  );
}
