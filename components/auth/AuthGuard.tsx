"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/supabase/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredTier?: "starter" | "pro" | "elite" | "vip";
}

const TIER_RANK: Record<string, number> = {
  free: 0, starter: 1, pro: 2, elite: 3, vip: 4,
};

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin mx-auto mb-4" />
      <p className="text-brand-muted text-sm">Loading…</p>
    </div>
  </div>
);

export function AuthGuard({ children, requireAdmin = false, requiredTier }: AuthGuardProps) {
  const { user, profile, loading, profileLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for both auth and profile to finish loading before making any decisions
    if (loading || profileLoading) return;

    // Not logged in → send to login
    if (!user) {
      router.replace("/login");
      return;
    }

    // Admin check — only redirect once profile is confirmed loaded
    if (requireAdmin && !profile?.is_admin) {
      router.replace("/dashboard");
      return;
    }

    // Tier check — admins bypass tier restrictions entirely
    if (requiredTier && profile && !profile.is_admin) {
      const userRank     = TIER_RANK[profile.tier] ?? 0;
      const requiredRank = TIER_RANK[requiredTier] ?? 0;
      if (userRank < requiredRank) {
        router.replace("/pricing");
        return;
      }
    }
  }, [user, profile, loading, profileLoading, router, requireAdmin, requiredTier]);

  // Show spinner while auth OR profile is still loading
  if (loading || profileLoading) return <Spinner />;

  // Not logged in
  if (!user) return null;

  // Admin page but not admin
  if (requireAdmin && !profile?.is_admin) return null;

  return <>{children}</>;
}
