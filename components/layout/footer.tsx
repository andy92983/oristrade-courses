import Link from "next/link";
import { OrisLogoFull } from "../brand/OrisLogo";

const footerLinks = {
  Platform: [
    { label: "Signal Dashboard", href: "/signals" },
    { label: "Markets", href: "/markets" },
    { label: "Options Analytics", href: "/signals" },
    { label: "Pricing", href: "/pricing" },
  ],
  Learn: [
    { label: "Education Hub", href: "/education" },
    { label: "Blog & Analysis", href: "/blog" },
    { label: "YouTube Channel", href: "https://youtube.com/@OrisTrade", external: true },
    { label: "About OrisTrade", href: "/about" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Risk Disclosure", href: "/risk" },
    { label: "Contact Us", href: "/contact" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-card mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top: Logo + links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <OrisLogoFull className="h-10 w-auto max-w-[240px]" />
            </Link>
            <p className="text-brand-muted text-sm leading-relaxed mb-6">
              Where Precision Meets Profit. 12-layer market intelligence for traders who want the edge.
            </p>
            <a
              href="mailto:hello@oristrade.com"
              className="text-brand-gold text-sm hover:text-brand-gold-light transition-colors"
            >
              hello@oristrade.com
            </a>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-brand-muted hover:text-white text-sm transition-colors"
                      {...("external" in link && link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="border-t border-brand-border pt-8">
          <p className="text-brand-muted text-xs leading-relaxed mb-4">
            <strong className="text-brand-muted">Risk Disclosure:</strong> All content on OrisTrade is for educational
            and informational purposes only and does not constitute financial advice, investment advice, trading advice,
            or any other sort of advice. Trading involves significant risk of loss and is not suitable for all investors.
            Past performance does not guarantee future results. OrisTrade is not a registered investment advisor.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-brand-muted text-xs">
              © {new Date().getFullYear()} OrisTrade. All rights reserved.
            </p>
            <p className="text-brand-muted text-xs">
              oristrade.com — Precision. Timing. The Trade.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
