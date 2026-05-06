import Link from "next/link";

/** Single source for site-wide risk / educational disclosure (footer, banners, etc.). */
export const SITE_DISCLAIMER_FULL =
  "All content on OrisTrade is for educational and informational purposes only and does not constitute financial advice, investment advice, trading advice, or any other sort of advice. Trading involves significant risk of loss and is not suitable for all investors. Past performance does not guarantee future results. OrisTrade is not a registered investment advisor.";

/**
 * In-flow footer block (not fixed) — disclosure at the end of every page.
 */
export function SiteDisclaimerFooter() {
  return (
    <aside
      role="note"
      aria-label="Risk and educational disclaimer"
      className="border-t border-brand-border bg-brand-card"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-5 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
        <p className="text-brand-muted text-[11px] sm:text-xs leading-relaxed">
          <strong className="text-brand-muted font-semibold">Risk disclosure:</strong> {SITE_DISCLAIMER_FULL}
        </p>
        <nav
          aria-label="Legal links"
          className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] sm:text-xs"
        >
          <Link href="/terms" className="text-brand-gold/90 hover:text-brand-gold underline-offset-2 hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="text-brand-gold/90 hover:text-brand-gold underline-offset-2 hover:underline">
            Privacy
          </Link>
          <Link href="/risk" className="text-brand-gold/90 hover:text-brand-gold underline-offset-2 hover:underline">
            Risk disclosure
          </Link>
        </nav>
      </div>
    </aside>
  );
}
