"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/supabase/useAuth";
import { signOut } from "../../lib/supabase/auth";
import { TIER_CONFIG } from "../../lib/supabase/client";
import { OrisLogoFull, OrisLogoMark } from "../brand/OrisLogo";

// ─── Nav structure ────────────────────────────────────────────────────────────
const NAV = [
  {
    group: "Trading",
    links: [
      { label: "Dashboard",     href: "/dashboard",     icon: "⚡" },
      { label: "Charts",        href: "/charts",         icon: "📈" },
      { label: "Signals",       href: "/signals",        icon: "🎯" },
      { label: "Markets",       href: "/markets",        icon: "🌍" },
    ],
  },
  {
    group: "Tools",
    links: [
      { label: "OrisTrade Bot", href: "/bot",            icon: "🤖" },
      { label: "AI Team Builder", href: "/ai-team-builder", icon: "🏗️" },
      { label: "Live Feed",     href: "/live-feed",      icon: "📰" },
      { label: "SPX Liquidity", href: "/spx-liquidity", icon: "💧" },
      { label: "Options Flow",  href: "/options-flow",  icon: "🌊" },
      { label: "Journal",       href: "/journal",        icon: "📓" },
    ],
  },
  {
    group: "Learn",
    links: [
      { label: "Education",     href: "/education",     icon: "🎓" },
      { label: "Blog",          href: "/blog",           icon: "📰" },
    ],
  },
  {
    group: "Company",
    links: [
      { label: "About",         href: "/about",          icon: "ℹ️" },
      { label: "Pricing",       href: "/pricing",        icon: "💰" },
    ],
  },
];

const ADMIN_LINKS = [
  { label: "Admin",          href: "/admin",            icon: "🛡️" },
  { label: "Claude Usage",   href: "/admin/claude-usage", icon: "🤖" },
  { label: "Progress",       href: "/progress",         icon: "📊" },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname    = usePathname();
  const { user, profile, isAdmin } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    setMobileOpen(false);
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    // Exact match for /admin, not startsWith
    if (href === "/admin") return pathname === "/admin";
    // For other paths, use startsWith
    return pathname.startsWith(href);
  };

  // ── Shared nav link renderer ──
  function NavLink({ link, onClick }: { link: { label: string; href: string; icon: string }; onClick?: () => void }) {
    const active = isActive(link.href);
    return (
      <Link
        href={link.href}
        title={collapsed ? link.label : undefined}
        onClick={onClick}
        className={`
          group flex items-center rounded-lg transition-all duration-150
          ${collapsed ? "justify-center px-0 py-2.5 mx-1" : "gap-3 px-3 py-2"}
          ${
            active
              ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/20"
              : "text-brand-muted hover:text-white hover:bg-white/5 border border-transparent"
          }
        `}
      >
        <span className="text-base leading-none flex-shrink-0">{link.icon}</span>
        {!collapsed && <span className="text-sm font-medium">{link.label}</span>}
      </Link>
    );
  }

  const sidebarWidth = collapsed ? "w-14" : "w-60";

  // ── Sidebar panel (shared between desktop + mobile) ──
  function SidebarPanel({ mobile = false }: { mobile?: boolean }) {
    const close = mobile ? () => setMobileOpen(false) : undefined;
    const showLabels = mobile || !collapsed;

    return (
      <div className="flex flex-col h-full">
        {/* Logo + toggle */}
        <div
          className={`flex items-center border-b border-brand-border flex-shrink-0 h-14 ${
            collapsed && !mobile ? "px-1 justify-between gap-1" : "px-4 justify-between"
          }`}
        >
          {collapsed && !mobile ? (
            <>
              <Link href="/" title="OrisTrade" className="flex flex-1 justify-center min-w-0 py-1">
                <OrisLogoMark className="h-8 w-8" />
              </Link>
              <button
                onClick={onToggle}
                title="Expand sidebar"
                className="text-brand-muted hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <Link href="/" onClick={close} className="flex items-center min-w-0 flex-1 mr-2">
                <OrisLogoFull className="h-8 sm:h-9 max-w-[200px]" />
              </Link>
              {!mobile && (
                <button
                  onClick={onToggle}
                  title="Collapse sidebar"
                  className="text-brand-muted hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {mobile && (
                <button onClick={close} className="text-brand-muted hover:text-white p-1.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>

        {/* Nav links */}
        <nav className={`flex-1 overflow-y-auto py-3 ${collapsed && !mobile ? "px-0 space-y-4" : "px-2 space-y-4"}`}>
          {NAV.map((section) => (
            <div key={section.group}>
              {showLabels && (
                <p className="text-brand-muted text-[10px] font-bold uppercase tracking-widest px-3 mb-1.5">
                  {section.group}
                </p>
              )}
              {collapsed && !mobile && <div className="border-t border-brand-border/40 mx-2 mb-1" />}
              <ul className={`space-y-0.5 ${collapsed && !mobile ? "" : ""}`}>
                {section.links.map((link) => (
                  <li key={link.href}>
                    <NavLink link={link} onClick={close} />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {isAdmin && (
            <div>
              {showLabels && (
                <p className="text-brand-gold/60 text-[10px] font-bold uppercase tracking-widest px-3 mb-1.5">
                  Admin
                </p>
              )}
              {collapsed && !mobile && <div className="border-t border-brand-border/40 mx-2 mb-1" />}
              <ul className="space-y-0.5">
                {ADMIN_LINKS.map((link) => (
                  <li key={link.href}>
                    <NavLink link={link} onClick={close} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        {/* Auth — pinned to bottom */}
        <div className={`border-t border-brand-border flex-shrink-0 py-3 ${collapsed && !mobile ? "px-0" : "px-2"}`}>
          {user ? (
            <div className={`space-y-1 ${collapsed && !mobile ? "flex flex-col items-center" : ""}`}>
              <Link
                href="/account"
                onClick={close}
                title={collapsed && !mobile ? (profile?.full_name ?? "Account") : undefined}
                className={`flex items-center rounded-lg hover:bg-white/5 transition-colors ${collapsed && !mobile ? "justify-center p-2 mx-1" : "gap-2.5 px-3 py-2 w-full"}`}
              >
                <div className="w-7 h-7 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-gold text-xs font-bold">
                    {(profile?.full_name ?? user.email ?? "U")
                      .split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
                  </span>
                </div>
                {(!collapsed || mobile) && (
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-xs font-medium truncate">
                      {profile?.full_name ?? "Member"}
                    </div>
                    <div className={`text-[10px] font-bold ${TIER_CONFIG[profile?.tier ?? "free"].color}`}>
                      {TIER_CONFIG[profile?.tier ?? "free"].label}
                    </div>
                  </div>
                )}
              </Link>
              <button
                onClick={handleSignOut}
                title={collapsed && !mobile ? "Sign Out" : undefined}
                className={`flex items-center text-brand-muted hover:text-brand-red hover:bg-brand-red/5 rounded-lg transition-colors text-xs ${collapsed && !mobile ? "justify-center p-2 mx-1 w-[calc(100%-8px)]" : "gap-2.5 px-3 py-1.5 w-full"}`}
              >
                <span>🚪</span>
                {(!collapsed || mobile) && "Sign Out"}
              </button>
            </div>
          ) : (
            <div className={`space-y-2 ${collapsed && !mobile ? "px-1" : "px-1"}`}>
              {collapsed && !mobile ? (
                <Link href="/login" title="Log in" className="flex justify-center p-2 text-brand-muted hover:text-white transition-colors rounded-lg hover:bg-white/5">
                  <span>👤</span>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={close} className="block text-center text-sm text-brand-muted hover:text-white transition-colors py-1.5">
                    Log in
                  </Link>
                  <Link href="/pricing" onClick={close} className="btn-gold text-sm text-center block">
                    Start Free →
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-brand-bg/95 backdrop-blur-md border-b border-brand-border flex items-center justify-between px-4">
        <Link href="/" className="flex items-center min-w-0 max-w-[72%]">
          <OrisLogoFull className="h-8 w-auto max-h-8" />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-brand-muted hover:text-white p-2"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-brand-bg/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-screen w-60 bg-brand-bg border-r border-brand-border transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarPanel mobile />
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 left-0 z-50 h-screen bg-brand-bg border-r border-brand-border transition-[width] duration-200 overflow-hidden ${sidebarWidth}`}
      >
        <SidebarPanel />
      </aside>
    </>
  );
}
