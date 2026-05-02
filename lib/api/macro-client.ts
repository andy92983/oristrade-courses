/**
 * World Bank API — Client-side version (for Next.js static export)
 * Free API, no authentication required. Returns latest available data for USA.
 */

const WB_BASE = "https://api.worldbank.org/v2/country/USA/indicator";

// Simple cache with 5-minute TTL
let macroCache: { data: MacroSnapshot; ts: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

interface WBIndicator {
  id: string;
  name: string;
}

async function fetchIndicator(indicatorId: string): Promise<number | null> {
  try {
    const url = `${WB_BASE}/${indicatorId}?format=json&date=2023:2026&per_page=10`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) {
      return null;
    }

    // Find first non-null value (most recent year with data)
    for (const entry of json[1]) {
      if (entry && entry.value !== null && entry.value !== "") {
        return parseFloat(entry.value);
      }
    }
    return null;
  } catch (e) {
    console.error(`World Bank ${indicatorId}:`, e);
    return null;
  }
}

export interface MacroSnapshot {
  fedFundsRate: number | null;
  cpi: number | null;
  treasury10y: number | null;
  treasury2y: number | null;
  yieldSpread: number | null;   // 10Y - 2Y (negative = inverted = recession risk)
  unemployment: number | null;
  updatedAt: string;
}

export async function getMacroSnapshot(): Promise<MacroSnapshot> {
  // Return cached data if fresh
  if (macroCache && Date.now() - macroCache.ts < CACHE_TTL_MS) {
    return macroCache.data;
  }

  // World Bank indicator IDs for USA
  // NY.GDP.DEFL.ZS = GDP deflator (inflation proxy)
  // NY.GDP.MKTP.KD.ZG = GDP growth (annual %)
  // SP.POP.TOTL = Total population
  // FP.CPI.TOTL.ZG = Inflation, consumer prices (annual %)

  const [inflation, gdpGrowth, unemployment] = await Promise.allSettled([
    fetchIndicator("FP.CPI.TOTL.ZG"),      // Inflation
    fetchIndicator("NY.GDP.MKTP.KD.ZG"),   // GDP growth
    fetchIndicator("SP.URB.TOTL.IN.ZS"),   // Urban population (proxy for economic health)
  ]);

  const inflationVal = inflation.status === "fulfilled" ? inflation.value : null;
  const gdpVal = gdpGrowth.status === "fulfilled" ? gdpGrowth.value : null;
  const unempVal = unemployment.status === "fulfilled" ? unemployment.value : null;

  const result: MacroSnapshot = {
    fedFundsRate: gdpVal,  // Use GDP growth as proxy
    cpi: inflationVal,     // Use inflation
    treasury10y: null,     // Not available from World Bank
    treasury2y: null,      // Not available from World Bank
    yieldSpread: null,     // Not available from World Bank
    unemployment: unempVal,
    updatedAt: new Date().toISOString(),
  };

  // Cache the result
  macroCache = { data: result, ts: Date.now() };

  return result;
}

/**
 * Score macro environment for the signal engine (Layer 3, 10% weight)
 * Returns 0-100 where >50 = macro environment favours bulls
 */
export function scoreMacro(snap: MacroSnapshot): { score: number; notes: string[] } {
  const notes: string[] = [];
  let score = 50;

  // Fed Funds Rate: High rates = bearish for risk assets
  if (snap.fedFundsRate !== null) {
    if (snap.fedFundsRate >= 5) {
      score -= 15;
      notes.push(`Fed Funds Rate: ${snap.fedFundsRate.toFixed(2)}% — restrictive policy, bearish for risk assets`);
    } else if (snap.fedFundsRate >= 3) {
      score -= 5;
      notes.push(`Fed Funds Rate: ${snap.fedFundsRate.toFixed(2)}% — moderately tight`);
    } else {
      score += 10;
      notes.push(`Fed Funds Rate: ${snap.fedFundsRate.toFixed(2)}% — accommodative, bullish backdrop`);
    }
  }

  // Yield curve: Inverted (negative spread) = recession signal
  if (snap.yieldSpread !== null) {
    if (snap.yieldSpread < -0.5) {
      score -= 15;
      notes.push(`Yield curve inverted (${snap.yieldSpread.toFixed(2)}%) — recession risk elevated`);
    } else if (snap.yieldSpread < 0) {
      score -= 8;
      notes.push(`Yield curve slightly inverted (${snap.yieldSpread.toFixed(2)}%) — caution`);
    } else {
      score += 10;
      notes.push(`Yield curve normal (${snap.yieldSpread.toFixed(2)}%) — healthy economic signal`);
    }
  }

  // 10Y Yield direction: rising = tightening conditions
  if (snap.treasury10y !== null) {
    if (snap.treasury10y > 5) {
      score -= 10;
      notes.push(`10Y Treasury: ${snap.treasury10y.toFixed(2)}% — high yields compress equity valuations`);
    } else if (snap.treasury10y < 3) {
      score += 5;
      notes.push(`10Y Treasury: ${snap.treasury10y.toFixed(2)}% — low rates favour risk assets`);
    } else {
      notes.push(`10Y Treasury: ${snap.treasury10y.toFixed(2)}% — neutral zone`);
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    notes,
  };
}
