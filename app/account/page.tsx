"use client";

import Link from "next/link";
import { AuthGuard } from "../../components/auth/AuthGuard";
import { useAuth } from "../../lib/supabase/useAuth";
import { TIER_CONFIG, type Tier } from "../../lib/supabase/client";

// Stripe test payment links — replace with your real Stripe test links
const STRIPE_LINKS: Record<Tier, string | null> = {
  free:    null,
  starter: "https://buy.stripe.com/test_REPLACE_STARTER",
  pro:     "https://buy.stripe.com/test_REPLACE_PRO",
  elite:   "https://buy.stripe.com/test_REPLACE_ELITE",
  vip:     "https://buy.stripe.com/test_REPLACE_VIP",
};

// What each tier unlocks
const TIER_FEATURES: Record<Tier, string[]> = {
  free:    ["Live market charts", "Sample signals", "Blog & education"],
  starter: ["Layers 1–2 signals", "Basic dashboard", "Course library"],
  pro:     ["Layers 1–6", "Live order flow", "Options analytics"],
  elite:   ["All 12 layers", "Trade journal", "1-on-1 monthly call"],
  vip:     ["Institutional signals", "Private community", "Fund research"],
};

function AccountContent() {
  const { user, profile } = useAuth();
  const tier = profile?.tier ?? "free";
  const conf = TIER_CONFIG[tier];

  const nextTier: Record<Tier, Tier | null> = {
    free: "starter", starter: "pro", pro: "elite", elite: "vip", vip: null,
  };
  const next = nextTier[tier];
  const nextConf = next ? TIER_CONFIG[next] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pt-24">
      <div className="mb-8">
        <h1 className="font-display font-black text-3xl text-white mb-1">My Account</h1>
        <p className="text-brand-muted">Manage your profile and subscription</p>
      </div>

      {/* Profile card */}
      <div className="card mb-6">
        <h2 className="font-semibold text-white mb-4">Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center">
            <span className="text-brand-gold font-display font-bold text-xl">
              {(profile?.full_name ?? user?.email ?? "U")[0].toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-white font-semibold">{profile?.full_name ?? "Member"}</div>
            <div className="text-brand-muted text-sm">{user?.email}</div>
            <div className="mt-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${conf.bg} ${conf.color}`}>
                {conf.label} — {conf.price}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Current plan */}
      <div className="card mb-6">
        <h2 className="font-semibold text-white mb-4">Current Plan</h2>
        <div className={`rounded-xl border p-5 mb-4 ${conf.bg}`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`font-display font-bold text-xl ${conf.color}`}>{conf.label}</span>
            <span className={`font-display font-bold text-2xl ${conf.color}`}>{conf.price}</span>
          </div>
          <ul className="space-y-1.5">
            {TIER_FEATURES[tier].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                <span className="text-brand-gold">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        {tier !== "free" && (
          <div className="flex gap-3">
            <a
              href="https://billing.stripe.com/p/login/test_REPLACE_PORTAL"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-sm"
            >
              Manage Billing →
            </a>
          </div>
        )}

        {tier === "free" && (
          <p className="text-brand-muted text-sm">
            You're on the free plan. Upgrade to access live signals.
          </p>
        )}
      </div>

      {/* Upgrade CTA */}
      {next && nextConf && (
        <div className="card border-brand-gold/30 glow-gold mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Upgrade to {nextConf.label}</h2>
            <span className={`font-display font-bold text-xl ${nextConf.color}`}>{nextConf.price}</span>
          </div>
          <ul className="space-y-1.5 mb-4">
            {TIER_FEATURES[next].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-brand-muted">
                <span className="text-brand-green">✓</span> {f}
              </li>
            ))}
          </ul>
          {STRIPE_LINKS[next] ? (
            <a href={STRIPE_LINKS[next]!} target="_blank" rel="noopener noreferrer" className="btn-gold inline-block">
              Upgrade to {nextConf.label} →
            </a>
          ) : (
            <Link href="/pricing" className="btn-gold inline-block">
              View All Plans →
            </Link>
          )}
        </div>
      )}

      {/* Account settings */}
      <div className="card">
        <h2 className="font-semibold text-white mb-4">Account Settings</h2>
        <div className="space-y-3 text-sm">
          <Link href="/login" className="flex items-center justify-between py-2 text-brand-muted hover:text-white transition-colors border-b border-brand-border">
            <span>Change Password</span>
            <span>→</span>
          </Link>
          <Link href="/contact" className="flex items-center justify-between py-2 text-brand-muted hover:text-white transition-colors">
            <span>Contact Support</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountContent />
    </AuthGuard>
  );
}
