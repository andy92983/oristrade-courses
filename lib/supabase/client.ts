import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

// Public anon keys — safe to include in client-side code (Supabase RLS protects the data)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kjtmslsboucvehhzdfty.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_LHwM8ShL6a5oN-41MeVEsQ_pApyEMMx";

/**
 * Cookie domain `.oristrade.com` shares the Supabase session between apex (marketing)
 * and subdomains (journal, courses, app). Default `createClient` uses localStorage,
 * which is per-origin only — a session on journal would not appear on oristrade.com.
 */
function orisTradeAuthCookieDomain(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const h = window.location.hostname;
  if (h === "localhost" || h === "127.0.0.1") return undefined;
  if (h === "oristrade.com" || h.endsWith(".oristrade.com")) return ".oristrade.com";
  return undefined;
}

let browserClient: SupabaseClient | null = null;
let buildFallbackClient: SupabaseClient | null = null;

function createSupabase(): SupabaseClient {
  if (typeof window !== "undefined") {
    if (!browserClient) {
      const domain = orisTradeAuthCookieDomain();
      browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
        cookieOptions: {
          path: "/",
          sameSite: "lax",
          secure: window.location.protocol === "https:",
          ...(domain ? { domain } : {}),
        },
      });
    }
    return browserClient;
  }
  if (!buildFallbackClient) {
    buildFallbackClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return buildFallbackClient;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = createSupabase();
    const value = Reflect.get(client, prop, client);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type Tier = "free" | "starter" | "pro" | "elite" | "vip";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  tier: Tier;
  is_admin: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
}

// Tier display config
export const TIER_CONFIG: Record<Tier, { label: string; color: string; bg: string; price: string }> = {
  free:    { label: "Free",           color: "text-brand-muted",  bg: "bg-brand-border",       price: "$0" },
  starter: { label: "Starter",        color: "text-brand-green",  bg: "bg-brand-green/10",     price: "$49/mo" },
  pro:     { label: "Pro",            color: "text-brand-gold",   bg: "bg-brand-gold/10",      price: "$99/mo" },
  elite:   { label: "Elite",          color: "text-blue-400",     bg: "bg-blue-400/10",        price: "$199/mo" },
  vip:     { label: "Hedge Fund VIP", color: "text-purple-400",   bg: "bg-purple-400/10",      price: "$499/mo" },
};
