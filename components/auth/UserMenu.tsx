"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/supabase/useAuth";
import { signOut } from "../../lib/supabase/auth";
import { TIER_CONFIG } from "../../lib/supabase/client";

export function UserMenu() {
  const { user, profile, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  if (loading) return <div className="w-8 h-8 rounded-full bg-brand-border animate-pulse" />;

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login" className="text-brand-muted hover:text-white text-sm font-medium transition-colors">
          Log in
        </Link>
        <Link href="/signup" className="btn-gold text-sm py-2 px-4">
          Start Free →
        </Link>
      </div>
    );
  }

  const tier = profile?.tier ?? "free";
  const tierConf = TIER_CONFIG[tier];
  const initials = (profile?.full_name ?? user.email ?? "U")
    .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center">
          <span className="text-brand-gold text-xs font-bold">{initials}</span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${tierConf.bg} ${tierConf.color}`}>
          {tierConf.label}
        </span>
        <svg className={`w-3 h-3 text-brand-muted transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-brand-card border border-brand-border rounded-xl shadow-xl overflow-hidden z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-brand-border">
            <div className="text-white text-sm font-semibold truncate">
              {profile?.full_name ?? "Member"}
            </div>
            <div className="text-brand-muted text-xs truncate">{user.email}</div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link href="/dashboard" onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-muted hover:text-white hover:bg-brand-bg transition-colors">
              <span>📊</span> Dashboard
            </Link>
            <Link href="/account" onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-muted hover:text-white hover:bg-brand-bg transition-colors">
              <span>👤</span> My Account
            </Link>
            <Link href="/pricing" onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-muted hover:text-white hover:bg-brand-bg transition-colors">
              <span>⚡</span> Upgrade Plan
            </Link>
            {profile?.is_admin && (
              <Link href="/admin" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-gold hover:bg-brand-bg transition-colors">
                <span>🔐</span> Admin Panel
              </Link>
            )}
          </div>

          {/* Sign out */}
          <div className="border-t border-brand-border py-1">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-brand-muted hover:text-brand-red hover:bg-brand-bg transition-colors"
            >
              <span>🚪</span> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
