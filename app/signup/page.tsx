"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "../../lib/supabase/auth";
import { supabase } from "../../lib/supabase/client";
import { OrisLogoFull } from "../../components/brand/OrisLogo";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
  }, [router]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error: err } = await signUp(email, password, fullName);
    setLoading(false);
    if (err) setError(err.message);
    else setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="font-display font-bold text-2xl text-white mb-3">Account created!</h1>
          <p className="text-brand-muted mb-2">
            We've sent a confirmation email to <span className="text-white font-semibold">{email}</span>
          </p>
          <p className="text-brand-muted text-sm mb-8">
            Click the link in the email to verify your account, then come back to sign in.
          </p>
          <Link href="/login" className="btn-gold inline-block">
            Go to Login →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <OrisLogoFull className="h-11 w-auto max-w-[min(280px,90vw)]" />
          </Link>
          <h1 className="font-display font-bold text-2xl text-white mb-1">Create Your Account</h1>
          <p className="text-brand-muted text-sm">Start with free access. Upgrade anytime.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-brand-red/10 border border-brand-red/30 rounded-lg px-4 py-3 text-brand-red text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-white text-sm font-medium mb-1.5">Full Name</label>
              <input
                type="text" required value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-white placeholder:text-brand-muted text-sm focus:outline-none focus:border-brand-gold/50 transition-colors"
              />
            </div>

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
              <label className="block text-white text-sm font-medium mb-1.5">Password</label>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-white placeholder:text-brand-muted text-sm focus:outline-none focus:border-brand-gold/50 transition-colors"
              />
            </div>

            {/* What you get */}
            <div className="bg-brand-green/5 border border-brand-green/20 rounded-xl p-4 space-y-1.5">
              <div className="text-brand-green text-xs font-semibold mb-2">Free account includes:</div>
              {["Live market charts & ticker tape", "Signal engine overview", "Education hub", "Blog & analysis"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-brand-muted">
                  <span className="text-brand-green">✓</span> {f}
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full text-center">
              {loading ? "Creating account…" : "Create Free Account →"}
            </button>
          </form>
        </div>

        <p className="text-center text-brand-muted text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-gold hover:underline font-semibold">
            Sign in
          </Link>
        </p>

        <p className="text-center text-brand-muted text-xs mt-4">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="hover:text-white">Terms of Service</Link> and{" "}
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
