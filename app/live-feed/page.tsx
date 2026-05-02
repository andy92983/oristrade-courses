"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "../../components/auth/AuthGuard";

interface NewsArticle {
  id: string;
  title: string;
  description?: string;
  source: string;
  category: "market" | "geopolitics" | "fed" | "tech" | "earnings";
  timestamp: string;
  url?: string;
  imageUrl?: string;
  sentiment?: "positive" | "negative" | "neutral";
}

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return "—";
  }
}

function getCategoryColor(category: NewsArticle["category"]): string {
  const colors: Record<NewsArticle["category"], string> = {
    market: "text-brand-green bg-brand-green/10 border-brand-green/30",
    geopolitics: "text-brand-red bg-brand-red/10 border-brand-red/30",
    fed: "text-brand-gold bg-brand-gold/10 border-brand-gold/30",
    tech: "text-brand-muted bg-white/5 border-brand-border",
    earnings: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  };
  return colors[category] || colors.market;
}

function getSentimentColor(sentiment?: string): string {
  switch (sentiment) {
    case "positive":
      return "text-brand-green";
    case "negative":
      return "text-brand-red";
    default:
      return "text-brand-muted";
  }
}

function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-brand-card border border-brand-border rounded-xl p-4 hover:border-brand-gold/50 transition-all hover:shadow-lg hover:shadow-brand-gold/10"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm leading-snug">{article.title}</h3>
        </div>
        {article.sentiment && (
          <span className={`text-[10px] font-bold flex-shrink-0 ${getSentimentColor(article.sentiment)}`}>
            {article.sentiment === "positive" ? "📈" : article.sentiment === "negative" ? "📉" : "→"}
          </span>
        )}
      </div>

      {article.description && (
        <p className="text-brand-muted text-xs mb-2 line-clamp-2">{article.description}</p>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-1 rounded border ${getCategoryColor(article.category)}`}>
            {article.category.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-brand-muted">
          <span>{article.source}</span>
          <span>•</span>
          <span>{formatTime(article.timestamp)}</span>
        </div>
      </div>
    </a>
  );
}

function LiveFeedInner() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<NewsArticle["category"] | "all">("all");
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const workerUrl = process.env.NEXT_PUBLIC_SIGNAL_WORKER_URL || "https://oristrade-signals.bergstromfinancials.workers.dev";
        const response = await fetch(`${workerUrl}/news?category=${selectedCategory === "all" ? "" : selectedCategory}`);

        if (!response.ok) {
          throw new Error(`Worker returned ${response.status}`);
        }

        const data = await response.json();
        setArticles(Array.isArray(data.articles) ? data.articles : []);
        setError(null);
        setCountdown(60); // Reset countdown after fetch
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch news";
        setError(message);
        // Show demo articles if Worker is unavailable
        setArticles(getDemoArticles());
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, [selectedCategory]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredArticles = selectedCategory === "all" ? articles : articles.filter((a) => a.category === selectedCategory);

  return (
    <div className="min-h-screen bg-brand-bg p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white mb-1">
          <span className="text-gradient-gold">Live</span> Feed
        </h1>
        <p className="text-brand-muted text-sm">
          Financial news & geopolitics — refreshed every 60s. Market-moving headlines in real-time.
        </p>
      </div>

      {/* Category filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "market", "geopolitics", "fed", "tech", "earnings"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              selectedCategory === cat
                ? "bg-brand-gold/20 text-brand-gold border-brand-gold/50"
                : "bg-brand-card text-brand-muted border-brand-border hover:border-brand-gold/30"
            }`}
          >
            {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
        <div className="ml-auto text-xs font-mono">
          {loading ? (
            <span className="text-brand-gold">Refreshing...</span>
          ) : (
            <span className={`${countdown <= 10 ? "text-brand-gold animate-pulse" : "text-brand-muted"}`}>
              Next refresh in {countdown}s
            </span>
          )}
        </div>
      </div>

      {/* News feed */}
      {error && !articles.length ? (
        <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-xl p-6 mb-6">
          <p className="text-brand-gold text-sm font-semibold mb-1">⚠️ Worker Not Connected</p>
          <p className="text-brand-muted text-xs mb-3">
            Cloudflare Worker endpoint is unavailable. Showing demo feed. Connect the Worker's /news endpoint to get live market feeds from Bloomberg, Reuters, MarketWatch, CNBC, and Financial Times.
          </p>
          <p className="text-brand-muted text-[11px] font-mono">Worker: {process.env.NEXT_PUBLIC_SIGNAL_WORKER_URL}</p>
        </div>
      ) : null}

      {loading && articles.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-brand-card border border-brand-border rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-brand-border rounded mb-3 w-3/4"></div>
              <div className="h-3 bg-brand-border rounded mb-2 w-full"></div>
              <div className="h-3 bg-brand-border rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-12 text-brand-muted">
          <p className="text-sm mb-1">No news in this category</p>
          <p className="text-xs">Try selecting a different category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {/* Status bar */}
      <div className="mt-8 pt-6 border-t border-brand-border text-center text-xs text-brand-muted">
        <p className="mb-1">Showing {filteredArticles.length} articles</p>
        <p className="text-[11px]">Sources: Bloomberg, Reuters, MarketWatch, CNBC, Financial Times, Wall Street Journal</p>
      </div>
    </div>
  );
}

function getDemoArticles(): NewsArticle[] {
  const now = new Date();
  return [
    {
      id: "1",
      title: "Fed Signals Potential Rate Pause as Inflation Cools",
      description: "Federal Reserve officials hint at possible end to interest rate hikes in upcoming meetings.",
      source: "Reuters",
      category: "fed",
      timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
      sentiment: "positive",
    },
    {
      id: "2",
      title: "Ukraine War Escalation Pushes Oil Prices Higher",
      description: "Geopolitical tensions reignite concerns about energy supply disruption.",
      source: "Bloomberg",
      category: "geopolitics",
      timestamp: new Date(now.getTime() - 12 * 60000).toISOString(),
      sentiment: "negative",
    },
    {
      id: "3",
      title: "S&P 500 Reaches New All-Time High",
      description: "Stock market rally continues as investors gain confidence in economic outlook.",
      source: "CNBC",
      category: "market",
      timestamp: new Date(now.getTime() - 25 * 60000).toISOString(),
      sentiment: "positive",
    },
    {
      id: "4",
      title: "Apple Earnings Beat Expectations, Guidance Strong",
      description: "AAPL stock surges on better-than-expected Q1 results and strong forward guidance.",
      source: "MarketWatch",
      category: "earnings",
      timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
      sentiment: "positive",
    },
    {
      id: "5",
      title: "Tesla Cuts Prices Again to Maintain Market Share",
      description: "EV maker continues aggressive pricing strategy to fend off competition.",
      source: "Financial Times",
      category: "tech",
      timestamp: new Date(now.getTime() - 78 * 60000).toISOString(),
      sentiment: "negative",
    },
    {
      id: "6",
      title: "China Economic Data Disappoints, Yuan Weakens",
      description: "Recent GDP figures fall short of forecasts, raising growth concerns.",
      source: "Bloomberg",
      category: "geopolitics",
      timestamp: new Date(now.getTime() - 112 * 60000).toISOString(),
      sentiment: "negative",
    },
  ];
}

export default function LiveFeedPage() {
  return (
    <AuthGuard requiredTier="starter">
      <LiveFeedInner />
    </AuthGuard>
  );
}
