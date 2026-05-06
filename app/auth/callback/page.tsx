"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase/client";
import { APP_DASHBOARD_URL } from "../../../lib/appUrls";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Supabase handles the token exchange automatically from the URL hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.replace(APP_DASHBOARD_URL);
      else router.replace("/login");
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin mx-auto mb-4" />
        <p className="text-brand-muted">Verifying your account…</p>
      </div>
    </div>
  );
}
