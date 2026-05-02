import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — OrisTrade",
  description:
    "Get in touch with the OrisTrade team. Questions about signals, memberships, partnerships, or the platform — we'd love to hear from you.",
};

const CONTACT_OPTIONS = [
  {
    icon: "📧",
    title: "General Enquiries",
    desc: "Questions about the platform, features, or getting started.",
    email: "hello@oristrade.com",
  },
  {
    icon: "🎓",
    title: "Membership Support",
    desc: "Help with your account, billing, or membership tier.",
    email: "members@oristrade.com",
  },
  {
    icon: "📊",
    title: "Trading & Signals",
    desc: "Questions about signals, data sources, or market coverage.",
    email: "trade@oristrade.com",
  },
  {
    icon: "💼",
    title: "Partnerships & Fund",
    desc: "Business partnerships, press enquiries, or hedge fund information.",
    email: "fund@oristrade.com",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="layer-badge mb-4 inline-block">CONTACT</span>
          <h1 className="font-display font-black text-4xl md:text-6xl text-white leading-tight mb-6">
            Get in <span className="text-gradient-gold">Touch</span>
          </h1>
          <p className="text-brand-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Questions about OrisTrade? We'd love to hear from you.
            Reach out via email or use the form below.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CONTACT_OPTIONS.map((opt) => (
            <div key={opt.title} className="card hover:border-brand-gold/30 transition-all duration-300">
              <div className="text-2xl mb-3">{opt.icon}</div>
              <h3 className="font-display font-bold text-white text-lg mb-1">{opt.title}</h3>
              <p className="text-brand-muted text-sm mb-3">{opt.desc}</p>
              <a
                href={`mailto:${opt.email}`}
                className="text-brand-gold text-sm font-semibold hover:text-brand-gold-light transition-colors"
              >
                {opt.email} →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 px-4 bg-brand-card/30 border-y border-brand-border">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="section-title">Send a Message</h2>
            <p className="section-subtitle">
              Fill out the form and we'll get back to you within 24 hours.
            </p>
          </div>

          <form
            action={`mailto:hello@oristrade.com`}
            method="POST"
            encType="text/plain"
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-white text-sm font-medium mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your name"
                  className="w-full bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-white placeholder:text-brand-muted text-sm focus:outline-none focus:border-brand-gold/50 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-white text-sm font-medium mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your@email.com"
                  className="w-full bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-white placeholder:text-brand-muted text-sm focus:outline-none focus:border-brand-gold/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-white text-sm font-medium mb-1.5">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                className="w-full bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-gold/50 transition-colors"
              >
                <option value="general">General Enquiry</option>
                <option value="membership">Membership & Billing</option>
                <option value="signals">Signals & Data</option>
                <option value="partnership">Partnership & Business</option>
                <option value="bug">Bug Report</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-white text-sm font-medium mb-1.5">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                placeholder="Tell us what's on your mind..."
                className="w-full bg-brand-card border border-brand-border rounded-lg px-4 py-3 text-white placeholder:text-brand-muted text-sm focus:outline-none focus:border-brand-gold/50 transition-colors resize-none"
              />
            </div>

            <button type="submit" className="btn-gold w-full text-center">
              Send Message →
            </button>
          </form>
        </div>
      </section>

      {/* Social */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="section-title mb-4">Follow OrisTrade</h2>
          <p className="section-subtitle mb-8">Stay updated with market analysis, new features, and trading insights.</p>
          <div className="flex justify-center gap-4">
            <a
              href="https://youtube.com/@OrisTrade"
              target="_blank"
              rel="noopener noreferrer"
              className="card flex items-center gap-3 px-6 py-4 hover:border-brand-gold/30 transition-all duration-300"
            >
              <svg className="w-6 h-6 text-brand-red" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span className="text-white text-sm font-medium">YouTube</span>
            </a>
            <a
              href="https://twitter.com/OrisTrade"
              target="_blank"
              rel="noopener noreferrer"
              className="card flex items-center gap-3 px-6 py-4 hover:border-brand-gold/30 transition-all duration-300"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-white text-sm font-medium">X (Twitter)</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
