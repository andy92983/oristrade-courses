/**
 * Client-side Sentiment APIs for OrisTrade Layer 4
 * - Alternative.me: Crypto Fear & Greed (free, CORS enabled)
 * - Put/Call Ratio: placeholder until Cloudflare Worker proxy is live
 */

// Simple cache with 5-minute TTL
let sentimentCache: { data: SentimentSnapshot; ts: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

export interface FearGreedData {
  value: number;
  label: string;    // "Extreme Fear" | "Fear" | "Neutral" | "Greed" | "Extreme Greed"
  updatedAt: string;
}

export async function getCryptoFearGreed(): Promise<FearGreedData> {
  const res = await fetch("https://api.alternative.me/fng/?limit=1");
  if (!res.ok) throw new Error(`Alternative.me: HTTP ${res.status}`);
  const json = await res.json();
  const item = json.data[0];
  return {
    value: parseInt(item.value, 10),
    label: item.value_classification,
    updatedAt: new Date(parseInt(item.timestamp, 10) * 1000).toISOString(),
  };
}

export interface SentimentSnapshot {
  cryptoFearGreed: FearGreedData | null;
  putCallRatio: number | null;    // Phase 2 — requires Worker proxy
  score: number;                  // 0-100 Layer 4 score
  direction: "bullish" | "neutral" | "bearish";
  notes: string[];
}

/**
 * Fear & Greed → signal score (contrarian approach):
 * Extreme Fear (0-20)  → BUY signal (market oversold, smart money buying)
 * Fear (21-40)         → Mild BUY
 * Neutral (41-60)      → No edge
 * Greed (61-80)        → Mild SELL (market extended)
 * Extreme Greed (81-100) → SELL signal (market euphoric, top may be near)
 */
export function scoreFearGreed(value: number): { score: number; note: string } {
  if (value <= 10)  return { score: 90, note: `Extreme Fear (${value}) — maximum contrarian BUY signal` };
  if (value <= 20)  return { score: 80, note: `Extreme Fear (${value}) — strong contrarian buy territory` };
  if (value <= 35)  return { score: 65, note: `Fear (${value}) — mild bullish contrarian signal` };
  if (value <= 50)  return { score: 52, note: `Neutral-Fear (${value}) — slight bullish lean` };
  if (value <= 65)  return { score: 48, note: `Neutral-Greed (${value}) — slight bearish lean` };
  if (value <= 80)  return { score: 35, note: `Greed (${value}) — market extended, caution` };
  if (value <= 90)  return { score: 20, note: `Extreme Greed (${value}) — euphoria, contrarian sell signal` };
  return { score: 10, note: `Extreme Greed (${value}) — maximum contrarian SELL signal` };
}

export async function getSentimentSnapshot(): Promise<SentimentSnapshot> {
  // Return cached data if fresh
  if (sentimentCache && Date.now() - sentimentCache.ts < CACHE_TTL_MS) {
    return sentimentCache.data;
  }

  const notes: string[] = [];

  const fg = await getCryptoFearGreed().catch(() => null);
  const fgScore = fg ? scoreFearGreed(fg.value) : null;

  if (fgScore) notes.push(fgScore.note);
  notes.push("Put/Call Ratio: pending Cloudflare Worker integration (Phase 2)");

  const score = fgScore?.score ?? 50;
  const direction = score >= 60 ? "bullish" : score <= 40 ? "bearish" : "neutral";

  const result: SentimentSnapshot = {
    cryptoFearGreed: fg,
    putCallRatio: null,
    score,
    direction,
    notes,
  };

  // Cache the result
  sentimentCache = { data: result, ts: Date.now() };

  return result;
}
