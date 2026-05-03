"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, sendPasswordReset } from "../../lib/supabase/auth";
import { supabase } from "../../lib/supabase/client";
import { OrisLogoFull } from "../../components/brand/OrisLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error: err } = await sendPasswordReset(email);
    setLoading(false);
    if (err) setError(err.message);
    else setResetSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <OrisLogoFull className="h-11 w-auto max-w-[min(280px,90vw)]" />
          </Link>
          <h1 className="font-display font-bold text-2xl text-white mb-1">
            {showReset ? "Reset Password" : "Welcome Back"}
          </h1>
          <p className="text-brand-muted text-sm">
            {showReset ? "We'll send a reset link to your email." : "Sign in to your OrisTrade account"}
          </p>
        </div>

        <div className="card">
          {resetSent ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="font-display font-bold text-white text-lg mb-2">Check your email</h3>
              <p className="text-brand-muted text-sm mb-4">
                We've sent a password reset link to <span className="text-white">{email}</span>
              </p>
              <button
                onClick={() => { setShowReset(false); setResetSent(false); }}
                className="text-brand-gold text-sm hover:underline"
              >
                Back to login
              </button>
            </div>
          ) : showReset ? (
            <form onSubmit={handleReset} className="space-y-4">
              {error && (
                <div className="bg-brand-red/10 border border-brand-red/30 rounded-lg px-4 py-3 text-brand-red text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-white text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-white placeholder:text-brand-muted text-sm focus:outline-none focus:border-brand-gold/50 transition-colors"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-gold w-full text-center">
                {loading ? "Sending…" : "Send Reset Link →"}
              </button>
              <button type="button" onClick={() => setShowReset(false)} className="w-full text-brand-muted text-sm hover:text-white text-center mt-2">
                Back to login
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-brand-red/10 border border-brand-red/30 rounded-lg px-4 py-3 text-brand-red text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-white text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-white placeholder:text-brand-muted text-sm focus:outline-none focus:border-brand-gold/50 transition-colors"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-white text-sm font-medium">Password</label>
                  <button type="button" onClick={() => setShowReset(true)} className="text-brand-gold text-xs hover:underline">
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-white placeholder:text-brand-muted text-sm focus:outline-none focus:border-brand-gold/50 transition-colors"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-gold w-full text-center">
                {loading ? "Signing in…" : "Sign In →"}
              </button>
            </form>
          )}
        </div>

        {!showReset && !resetSent && (
          <p className="text-center text-brand-muted text-sm mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-brand-gold hover:underline font-semibold">
              Sign up free
            </Link>
          </p>
        )}

        <p className="text-center text-brand-muted text-xs mt-4">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="hover:text-white">Terms of Service</Link> and{" "}
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
