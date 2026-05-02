"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, type Profile } from "./client";
import { getProfile } from "./auth";
import type { Session, User } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  profileLoading: boolean;
  isAdmin: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser]                   = useState<User | null>(null);
  const [profile, setProfile]             = useState<Profile | null>(null);
  const [session, setSession]             = useState<Session | null>(null);
  const [loading, setLoading]             = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  const loadProfile = useCallback(async (u: User) => {
    setProfileLoading(true);
    // Retry once — handles brief timing issues on first load
    let p = await getProfile(u.id);
    if (!p) {
      await new Promise((r) => setTimeout(r, 800));
      p = await getProfile(u.id);
    }
    setProfile(p);
    setProfileLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadProfile(s.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
        setProfileLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user);
      else { setProfile(null); setProfileLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  return {
    user,
    profile,
    session,
    loading,
    profileLoading,
    isAdmin: profile?.is_admin ?? false,
  };
}
