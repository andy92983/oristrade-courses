"use client";

import Link from "next/link";
import { useState } from "react";

export default function AITeamBuilderPage() {
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    const cmd = "curl -s https://oristrade.com/api/setup/paperclip-oristrade.sh | bash";
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <div className="text-6xl mb-6">🤖</div>
          <h1 className="font-display font-black text-4xl md:text-5xl text-white mb-4">
            Build Your AI Trading Team
          </h1>
          <p className="text-brand-muted text-lg max-w-2xl mx-auto mb-8">
            One CEO. Five specialists. Zero human involvement after setup.
          </p>
          <p className="text-brand-gold text-sm font-bold tracking-wide">
            ✨ FULLY AUTONOMOUS RESEARCH, BACKTESTING & EXECUTION
          </p>
        </div>

        {/* How It Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="card border border-brand-border/50 hover:border-brand-gold/30 transition-colors">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="font-display font-bold text-white text-lg mb-2">5-Minute Setup</h3>
            <p className="text-brand-muted text-sm">
              Answer 5 questions. Paste one command. Your firm spins up in 30 minutes on your Mac.
            </p>
          </div>
          <div className="card border border-brand-border/50 hover:border-brand-gold/30 transition-colors">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="font-display font-bold text-white text-lg mb-2">6 Claude Agents</h3>
            <p className="text-brand-muted text-sm">
              CEO orchestrates: Research, Backtest, Risk, Execution, and Cost Optimizer agents.
            </p>
          </div>
          <div className="card border border-brand-border/50 hover:border-brand-gold/30 transition-colors">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="font-display font-bold text-white text-lg mb-2">Paper Trading Safe</h3>
            <p className="text-brand-muted text-sm">
              Agents default to paper trading. Live money requires your explicit Board approval.
            </p>
          </div>
        </div>

        {/* The Team */}
        <div className="mb-16">
          <h2 className="font-display font-bold text-white text-2xl mb-8 text-center">Your Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-brand-card/50 border border-brand-gold/20">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-3xl">👔</div>
                <div>
                  <h4 className="font-bold text-white">CEO</h4>
                  <p className="text-brand-muted text-xs">Reports to you. Delegates everything.</p>
                </div>
              </div>
              <p className="text-sm text-brand-muted leading-relaxed">
                Triages your directives. Creates child tasks. Wakes specialists via comments. Tracks progress. Reports back with results.
              </p>
            </div>

            <div className="card bg-brand-card/50 border border-brand-border/50">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-3xl">🔬</div>
                <div>
                  <h4 className="font-bold text-white">Research Agent</h4>
                  <p className="text-brand-muted text-xs">Finds strategies</p>
                </div>
              </div>
              <p className="text-sm text-brand-muted leading-relaxed">
                Scans YouTube, arXiv, TradingView, Reddit. Scores ideas by novelty + feasibility + edge. Writes research briefs.
              </p>
            </div>

            <div className="card bg-brand-card/50 border border-brand-border/50">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-3xl">📊</div>
                <div>
                  <h4 className="font-bold text-white">Backtest Agent</h4>
                  <p className="text-brand-muted text-xs">Validates with data</p>
                </div>
              </div>
              <p className="text-sm text-brand-muted leading-relaxed">
                Runs 6+ months of historical backtests. Measures Sharpe, drawdown, win rate. Reports pass/fail vs thresholds.
              </p>
            </div>

            <div className="card bg-brand-card/50 border border-brand-border/50">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-3xl">🛡️</div>
                <div>
                  <h4 className="font-bold text-white">Risk Agent</h4>
                  <p className="text-brand-muted text-xs">Gate-keeper</p>
                </div>
              </div>
              <p className="text-sm text-brand-muted leading-relaxed">
                Final check before any trading. Verifies thresholds met. Enforces "paper mode by default." Only you unlock live money.
              </p>
            </div>

            <div className="card bg-brand-card/50 border border-brand-border/50">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-3xl">⚡</div>
                <div>
                  <h4 className="font-bold text-white">Execution Agent</h4>
                  <p className="text-brand-muted text-xs">Places trades</p>
                </div>
              </div>
              <p className="text-sm text-brand-muted leading-relaxed">
                Executes approved strategies. Logs every trade. Tracks daily P&L. Alerts on risk thresholds. Paper by default.
              </p>
            </div>

            <div className="card bg-brand-card/50 border border-brand-border/50">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-3xl">💰</div>
                <div>
                  <h4 className="font-bold text-white">Cost Optimizer</h4>
                  <p className="text-brand-muted text-xs">Reduces spend</p>
                </div>
              </div>
              <p className="text-sm text-brand-muted leading-relaxed">
                Monitors token usage. Finds where Haiku replaces Sonnet. Builds reusable templates. Cuts costs without cutting quality.
              </p>
            </div>
          </div>
        </div>

        {/* How You Control It */}
        <div className="card bg-gradient-to-r from-brand-gold/5 to-brand-card border border-brand-gold/20 mb-16">
          <h2 className="font-display font-bold text-white text-2xl mb-8">You Stay in Control</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-brand-gold font-bold mb-4">✓ Paper Trading by Default</h4>
              <p className="text-brand-muted text-sm leading-relaxed mb-4">
                All agents start in paper mode. No real money moves until you explicitly tell the CEO: "activate live trading."
              </p>
              <h4 className="text-brand-gold font-bold mb-4">✓ Risk Thresholds Locked</h4>
              <p className="text-brand-muted text-sm leading-relaxed">
                Your risk config is locked to Board-only changes. Agents cannot modify it. If something feels off, you can freeze trading in seconds.
              </p>
            </div>
            <div>
              <h4 className="text-brand-gold font-bold mb-4">✓ Full Audit Trail</h4>
              <p className="text-brand-muted text-sm leading-relaxed mb-4">
                Every research idea, backtest, trade, and decision is logged permanently. Nothing is deleted. Full transparency.
              </p>
              <h4 className="text-brand-gold font-bold mb-4">✓ You Talk to the CEO</h4>
              <p className="text-brand-muted text-sm leading-relaxed">
                Only interface: high-level directives to CEO. CEO handles all delegation. You never manage agents directly.
              </p>
            </div>
          </div>
        </div>

        {/* Example Workflow */}
        <div className="card bg-brand-card/50 border border-brand-border mb-16">
          <h2 className="font-display font-bold text-white text-2xl mb-6">Example: Your First Strategy</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="text-brand-gold font-bold min-w-12">1.</div>
              <div>
                <p className="text-white font-semibold">You → CEO</p>
                <p className="text-brand-muted text-sm">
                  "Test mean reversion on SPY 1-min using RSI oversold. Research existing ideas, backtest 6 months, then paper trade for 30 days."
                </p>
              </div>
            </div>
            <div className="border-l border-brand-gold/20 ml-6 pl-4">
              <div className="flex gap-4">
                <div className="text-brand-gold font-bold min-w-12">2.</div>
                <div>
                  <p className="text-white font-semibold">CEO → Research Agent</p>
                  <p className="text-brand-muted text-sm">
                    CEO creates task, comments @Research to wake them. Research scans 100+ ideas, scores, saves brief.
                  </p>
                </div>
              </div>
            </div>
            <div className="border-l border-brand-gold/20 ml-6 pl-4">
              <div className="flex gap-4">
                <div className="text-brand-gold font-bold min-w-12">3.</div>
                <div>
                  <p className="text-white font-semibold">CEO → Backtest Agent</p>
                  <p className="text-brand-muted text-sm">
                    Backtest Agent runs 6 months of data. Sharpe 1.8, Drawdown 9%. PASS.
                  </p>
                </div>
              </div>
            </div>
            <div className="border-l border-brand-gold/20 ml-6 pl-4">
              <div className="flex gap-4">
                <div className="text-brand-gold font-bold min-w-12">4.</div>
                <div>
                  <p className="text-white font-semibold">CEO → Risk Agent</p>
                  <p className="text-brand-muted text-sm">
                    Risk Agent verifies thresholds. Clears for paper trading.
                  </p>
                </div>
              </div>
            </div>
            <div className="border-l border-brand-gold/20 ml-6 pl-4">
              <div className="flex gap-4">
                <div className="text-brand-gold font-bold min-w-12">5.</div>
                <div>
                  <p className="text-white font-semibold">CEO → Execution Agent</p>
                  <p className="text-brand-muted text-sm">
                    Execution Agent paper trades for 30 days. +$3,240 profit. All trades logged.
                  </p>
                </div>
              </div>
            </div>
            <div className="border-l border-brand-gold/20 ml-6 pl-4">
              <div className="flex gap-4">
                <div className="text-brand-gold font-bold min-w-12">6.</div>
                <div>
                  <p className="text-white font-semibold">CEO → You</p>
                  <p className="text-brand-muted text-sm">
                    "Mean reversion passed 30-day paper test. +$3,240 profit. Risk Agent clears for live. Your call?"
                  </p>
                </div>
              </div>
            </div>
            <div className="border-l border-brand-gold/20 ml-6 pl-4">
              <div className="flex gap-4">
                <div className="text-brand-gold font-bold min-w-12">7.</div>
                <div>
                  <p className="text-white font-semibold">You → CEO</p>
                  <p className="text-brand-muted text-sm">
                    "Activate live trading. Mean reversion on SPY, 1-min, max $500 loss per day."
                  </p>
                </div>
              </div>
            </div>
            <div className="border-l border-brand-gold/20 ml-6 pl-4">
              <div className="flex gap-4">
                <div className="text-brand-gold font-bold min-w-12">8.</div>
                <div>
                  <p className="text-white font-semibold">Execution Agent: Live Trading Starts</p>
                  <p className="text-brand-muted text-sm">
                    Trades live money. Every trade logged. Daily reports to CEO. You monitor results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="card">
            <h3 className="font-display font-bold text-white text-lg mb-4">What You Get</h3>
            <ul className="space-y-3 text-sm text-brand-muted">
              <li className="flex items-start gap-2">
                <span className="text-brand-green">✓</span>
                <span>Fully autonomous trading firm on your Mac</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-green">✓</span>
                <span>6 Claude agents (CEO + 5 specialists)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-green">✓</span>
                <span>Local Paperclip server (no cloud dependency)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-green">✓</span>
                <span>Permanent audit logs of every decision</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-green">✓</span>
                <span>Risk thresholds locked to your control</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-green">✓</span>
                <span>Paper trading by default (safe testing)</span>
              </li>
            </ul>
          </div>
          <div className="card">
            <h3 className="font-display font-bold text-white text-lg mb-4">Requirements</h3>
            <ul className="space-y-3 text-sm text-brand-muted">
              <li className="flex items-start gap-2">
                <span className="text-brand-gold">•</span>
                <span><strong className="text-white">macOS</strong> (Intel or Apple Silicon M-series)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-gold">•</span>
                <span><strong className="text-white">Node.js</strong> 18+ (free, nodejs.org)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-gold">•</span>
                <span><strong className="text-white">Git</strong> (free, git-scm.com)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-gold">•</span>
                <span><strong className="text-white">Anthropic API key</strong> (console.anthropic.com — free tier OK)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-gold">•</span>
                <span><strong className="text-white">Claude Code</strong> (free desktop app or VS Code extension)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pricing */}
        <div className="card bg-gradient-to-r from-brand-gold/10 to-brand-card border border-brand-gold/30 mb-16">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-white text-2xl mb-2">Lifetime License</h2>
            <p className="text-brand-muted">One-time purchase. Build as many teams as you want.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card border border-brand-border/50">
              <h3 className="font-bold text-white mb-1">Starter</h3>
              <p className="text-brand-muted text-xs mb-4">Get going</p>
              <div className="text-3xl font-bold text-brand-gold mb-6">$299</div>
              <ul className="space-y-2 text-sm text-brand-muted mb-6">
                <li>✓ Local Paperclip server</li>
                <li>✓ 6 agents (CEO + 5)</li>
                <li>✓ Setup guide + docs</li>
                <li>✓ Email support (48h)</li>
              </ul>
              <button className="w-full bg-brand-gold/20 text-brand-gold py-2 rounded font-semibold text-sm hover:bg-brand-gold/30 transition-colors">
                Coming Soon
              </button>
            </div>

            <div className="card border border-brand-gold/50 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-brand-gold text-black px-3 py-1 rounded-full text-xs font-bold">POPULAR</span>
              </div>
              <h3 className="font-bold text-white mb-1 mt-4">Professional</h3>
              <p className="text-brand-muted text-xs mb-4">Recommended</p>
              <div className="text-3xl font-bold text-brand-gold mb-6">$699</div>
              <ul className="space-y-2 text-sm text-brand-muted mb-6">
                <li>✓ Everything in Starter</li>
                <li>✓ TradingView MCP integration</li>
                <li>✓ Custom agent templates</li>
                <li>✓ Priority email support (24h)</li>
                <li>✓ 1x setup call (30 min)</li>
              </ul>
              <button className="w-full bg-brand-gold text-black py-2 rounded font-semibold text-sm hover:bg-brand-gold/90 transition-colors">
                Coming Soon
              </button>
            </div>

            <div className="card border border-brand-border/50">
              <h3 className="font-bold text-white mb-1">Enterprise</h3>
              <p className="text-brand-muted text-xs mb-4">Hedge fund scale</p>
              <div className="text-3xl font-bold text-brand-gold mb-6">$1,999</div>
              <ul className="space-y-2 text-sm text-brand-muted mb-6">
                <li>✓ Everything in Pro</li>
                <li>✓ Unlimited custom agents</li>
                <li>✓ Broker API integration</li>
                <li>✓ Live trading setup</li>
                <li>✓ Dedicated support + Discord</li>
              </ul>
              <button className="w-full bg-brand-gold/20 text-brand-gold py-2 rounded font-semibold text-sm hover:bg-brand-gold/30 transition-colors">
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="card border-2 border-brand-gold/50 bg-brand-card/50 text-center py-12 mb-16">
          <h2 className="font-display font-bold text-white text-2xl mb-4">Ready to Build Your Team?</h2>
          <p className="text-brand-muted mb-8 max-w-xl mx-auto">
            We're launching the AI Team Builder in May 2026. Get on the waitlist for early access + lifetime discount.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-gold">
              Join Waitlist
            </button>
            <Link href="/contact" className="btn-outline">
              Questions? Contact Us
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="font-display font-bold text-white text-2xl mb-8 text-center">FAQ</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            <details className="card cursor-pointer group">
              <summary className="font-semibold text-white flex justify-between items-center">
                <span>Is this a real trading system?</span>
                <span className="text-brand-gold group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-brand-muted text-sm mt-4">
                Yes. Your agents research real strategies, backtest on real historical data, and execute real trades on real brokerage accounts (if you enable live trading). Paper trading is the default for safety testing.
              </p>
            </details>

            <details className="card cursor-pointer group">
              <summary className="font-semibold text-white flex justify-between items-center">
                <span>Do I need to code?</span>
                <span className="text-brand-gold group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-brand-muted text-sm mt-4">
                No. You answer 5 setup questions, paste one command, and your firm spins up. Everything else is running agents and giving directives to the CEO. No programming required.
              </p>
            </details>

            <details className="card cursor-pointer group">
              <summary className="font-semibold text-white flex justify-between items-center">
                <span>How much does it cost to run?</span>
                <span className="text-brand-gold group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-brand-muted text-sm mt-4">
                You pay only for Claude API usage (token costs). Average cost: $5–$30/day depending on agent activity. Research + backtesting is cheaper than execution. Cost Optimizer agent actively reduces spend.
              </p>
            </details>

            <details className="card cursor-pointer group">
              <summary className="font-semibold text-white flex justify-between items-center">
                <span>Can I test with paper trading first?</span>
                <span className="text-brand-gold group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-brand-muted text-sm mt-4">
                Yes. Paper trading is the default. All agents start in paper mode. You can run full trading cycles for weeks/months risk-free before enabling live money. Live trading requires explicit Board approval.
              </p>
            </details>

            <details className="card cursor-pointer group">
              <summary className="font-semibold text-white flex justify-between items-center">
                <span>What if something goes wrong?</span>
                <span className="text-brand-gold group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-brand-muted text-sm mt-4">
                Agents are designed to be defensive. Risk thresholds are locked. Paper trading is the default. Every action is logged. If you see something off, you can freeze trading or modify risk settings in seconds. Full transparency.
              </p>
            </details>

            <details className="card cursor-pointer group">
              <summary className="font-semibold text-white flex justify-between items-center">
                <span>Do I own the agents and strategies?</span>
                <span className="text-brand-gold group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-brand-muted text-sm mt-4">
                Yes. Everything runs on your Mac. Your Anthropic API key. Your strategies. Your trades. You own the whole system. We provide the framework and documentation.
              </p>
            </details>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-brand-card/50 border border-brand-border rounded-xl px-5 py-4">
          <p className="text-brand-muted text-xs leading-relaxed">
            <strong className="text-brand-muted">⚠️ Educational Disclaimer:</strong> The OrisTrade AI Team Builder is a research and backtesting framework for educational purposes only. Nothing here constitutes financial advice, investment advice, or a recommendation to buy or sell any security. Trading involves significant risk of loss. Past performance does not guarantee future results. You are solely responsible for any trading decisions and losses. OrisTrade is not a registered investment advisor. Always do your own research and consult a licensed advisor before trading with real money.
          </p>
        </div>
      </div>
    </div>
  );
}
