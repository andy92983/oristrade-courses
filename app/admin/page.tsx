"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "../../components/auth/AuthGuard";
import { getAllProfiles, updateUserTier } from "../../lib/supabase/auth";
import { TIER_CONFIG, type Profile, type Tier } from "../../lib/supabase/client";

const TIERS: Tier[] = ["free", "starter", "pro", "elite", "vip"];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card">
      <div className="text-brand-muted text-xs font-medium mb-1">{label}</div>
      <div className="font-display font-bold text-2xl text-white">{value}</div>
      {sub && <div className="text-brand-muted text-xs mt-1">{sub}</div>}
    </div>
  );
}

function AdminContent() {
  const [members, setMembers]   = useState<Profile[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [msg, setMsg]           = useState<string | null>(null);

  useEffect(() => {
    getAllProfiles().then((p) => { setMembers(p); setLoading(false); });
  }, []);

  const filtered = members.filter((m) =>
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const counts = TIERS.reduce((acc, t) => {
    acc[t] = members.filter((m) => m.tier === t).length;
    return acc;
  }, {} as Record<string, number>);

  const mrr =
    counts.starter * 49 +
    counts.pro     * 99 +
    counts.elite   * 199 +
    counts.vip     * 499;

  async function handleTierChange(userId: string, tier: string) {
    setUpdating(userId);
    const { error } = await updateUserTier(userId, tier);
    if (!error) {
      setMembers((prev) => prev.map((m) => m.id === userId ? { ...m, tier: tier as Tier } : m));
      setMsg("Tier updated ✓");
      setTimeout(() => setMsg(null), 2000);
    }
    setUpdating(null);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-brand-gold text-sm font-bold">🔐 ADMIN</span>
          </div>
          <h1 className="font-display font-black text-3xl text-white">Admin Dashboard</h1>
          <p className="text-brand-muted text-sm mt-1">Manage members, tiers, and platform stats</p>
        </div>
        {msg && (
          <div className="bg-brand-green/10 border border-brand-green/30 text-brand-green text-sm px-4 py-2 rounded-lg">
            {msg}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total Members"  value={members.length} />
        <StatCard label="Est. MRR"       value={`$${mrr.toLocaleString()}`} sub="test mode" />
        <StatCard label="Free"           value={counts.free    ?? 0} />
        <StatCard label="Starter ($49)"  value={counts.starter ?? 0} />
        <StatCard label="Pro ($99)"      value={counts.pro     ?? 0} />
        <StatCard label="Elite ($199)"   value={counts.elite   ?? 0} />
      </div>

      {/* Tier breakdown bar */}
      <div className="card mb-8">
        <h3 className="font-semibold text-white mb-4">Tier Distribution</h3>
        <div className="space-y-2">
          {TIERS.map((t) => {
            const conf  = TIER_CONFIG[t];
            const count = counts[t] ?? 0;
            const pct   = members.length ? Math.round((count / members.length) * 100) : 0;
            return (
              <div key={t} className="flex items-center gap-3">
                <span className={`text-xs font-semibold w-24 ${conf.color}`}>{conf.label}</span>
                <div className="flex-1 h-3 bg-brand-border rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${conf.bg} border ${conf.bg}`} style={{ width: `${pct}%`, backgroundColor: "currentColor", opacity: 0.7 }} />
                </div>
                <span className="text-brand-muted text-xs w-16 text-right">{count} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Claude Usage",        href: "/admin/claude-usage",                  icon: "🤖" },
          { label: "Stripe Dashboard",    href: "https://dashboard.stripe.com",        icon: "💳" },
          { label: "Supabase Dashboard",  href: "https://supabase.com/dashboard",      icon: "🗄️" },
          { label: "Cloudflare Pages",    href: "https://dash.cloudflare.com",         icon: "☁️" },
          { label: "GitHub Repo",         href: "https://github.com/andy92983/oristrade", icon: "💻" },
        ].map((link) => (
          <a key={link.label} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="card flex items-center gap-3 hover:border-brand-gold/30 transition-colors text-sm">
            <span className="text-xl">{link.icon}</span>
            <span className="text-white font-medium">{link.label} →</span>
          </a>
        ))}
      </div>

      {/* Members table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-white text-lg">Members</h3>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-white placeholder:text-brand-muted text-sm focus:outline-none focus:border-brand-gold/50 w-56"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 gap-3">
            <div className="w-5 h-5 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
            <span className="text-brand-muted text-sm">Loading members…</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left">
                  <th className="pb-3 text-brand-muted font-medium">Name</th>
                  <th className="pb-3 text-brand-muted font-medium">Email</th>
                  <th className="pb-3 text-brand-muted font-medium">Joined</th>
                  <th className="pb-3 text-brand-muted font-medium">Tier</th>
                  <th className="pb-3 text-brand-muted font-medium">Change Tier</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((member) => {
                  const conf = TIER_CONFIG[member.tier];
                  return (
                    <tr key={member.id} className="border-b border-brand-border/50 hover:bg-brand-bg/50">
                      <td className="py-3 text-white font-medium">
                        {member.full_name ?? "—"}
                        {member.is_admin && <span className="ml-1 text-brand-gold text-xs">🔐</span>}
                      </td>
                      <td className="py-3 text-brand-muted">{member.email}</td>
                      <td className="py-3 text-brand-muted">
                        {new Date(member.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${conf.bg} ${conf.color}`}>
                          {conf.label}
                        </span>
                      </td>
                      <td className="py-3">
                        <select
                          value={member.tier}
                          disabled={updating === member.id}
                          onChange={(e) => handleTierChange(member.id, e.target.value)}
                          className="bg-brand-card border border-brand-border rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-brand-gold/50 disabled:opacity-50"
                        >
                          {TIERS.map((t) => (
                            <option key={t} value={t}>{TIER_CONFIG[t].label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-brand-muted">No members found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard requireAdmin>
      <AdminContent />
    </AuthGuard>
  );
}
