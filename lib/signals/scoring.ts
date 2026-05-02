/**
 * OrisTrade Signal Scoring Engine
 * Combines all 12 layers into a single 0-100 confluence score
 *
 * Layer Weights (total = 100%):
 * Layer 1 — Order Flow:          25%
 * Layer 2 — Technical Analysis:  20%
 * Layer 3 — Macro Data:          10%
 * Layer 4 — Sentiment:           10%
 * Layer 5 — Congressional:        5%
 * Layer 6 — Intermarket:          8%
 * Layer 7 — Microstructure:       8%
 * Layer 8 — Pattern Recognition:  5%
 * Layer 9 — Options Analytics:    5%
 * Layer 10 — AI News:             2%
 * Layer 11 — Crypto:              1%
 * Layer 12 — Proprietary:         1%
 */

export type SignalDirection = "STRONG_BUY" | "BUY" | "WAIT" | "SELL" | "STRONG_SELL";

export interface LayerScore {
  layer: number;
  name: string;
  weight: number;          // Percentage weight (0–100)
  rawScore: number;        // 0–100 score for this layer
  weightedScore: number;   // rawScore * (weight / 100)
  notes: string[];         // Human-readable explanations
  available: boolean;      // Whether data was available
}

export interface ConfluenceSignal {
  symbol: string;
  timeframe: string;
  timestamp: string;
  totalScore: number;         // 0–100 weighted average
  direction: SignalDirection;
  layers: LayerScore[];
  entry?: number;
  stopLoss?: number;
  target1?: number;
  target2?: number;
  rrRatio?: string;
  newsBlackout: boolean;      // True if near high-impact event
  confidence: "high" | "medium" | "low";
}

const LAYER_WEIGHTS = {
  1: 25,  // Order Flow
  2: 20,  // Technical Analysis
  3: 10,  // Macro Data
  4: 10,  // Sentiment
  5: 5,   // Congressional & Insider
  6: 8,   // Intermarket
  7: 8,   // Microstructure
  8: 5,   // Pattern Recognition
  9: 5,   // Options Analytics
  10: 2,  // AI News
  11: 1,  // Crypto
  12: 1,  // Proprietary
};

const LAYER_NAMES = {
  1: "Order Flow",
  2: "Technical Analysis",
  3: "Macro & Economic",
  4: "Sentiment Intelligence",
  5: "Congressional & Insider",
  6: "Intermarket Analysis",
  7: "Market Microstructure",
  8: "Pattern Recognition AI",
  9: "Options Analytics",
  10: "AI News & Events",
  11: "Crypto Signals",
  12: "Proprietary Indicators",
};

export function getSignalDirection(score: number): SignalDirection {
  if (score >= 80) return "STRONG_BUY";
  if (score >= 60) return "BUY";
  if (score >= 40) return "WAIT";
  if (score >= 20) return "SELL";
  return "STRONG_SELL";
}

export function calculateWeightedScore(layers: LayerScore[]): number {
  const availableLayers = layers.filter((l) => l.available);
  if (availableLayers.length === 0) return 50; // Default to neutral

  // Normalize weights for available layers
  const totalAvailableWeight = availableLayers.reduce((sum, l) => sum + l.weight, 0);

  const weightedSum = availableLayers.reduce((sum, layer) => {
    const normalizedWeight = layer.weight / totalAvailableWeight;
    return sum + layer.rawScore * normalizedWeight;
  }, 0);

  return Math.round(weightedSum);
}

export function createLayerScore(
  layerNum: keyof typeof LAYER_WEIGHTS,
  rawScore: number,
  notes: string[],
  available = true
): LayerScore {
  const weight = LAYER_WEIGHTS[layerNum];
  return {
    layer: layerNum,
    name: LAYER_NAMES[layerNum],
    weight,
    rawScore,
    weightedScore: rawScore * (weight / 100),
    notes,
    available,
  };
}

/**
 * Calculate stop loss and take profit based on ATR and R:R preference
 */
export function calculateLevels(
  entry: number,
  direction: SignalDirection,
  atr: number,
  rrTarget = 2.0
): { stopLoss: number; target1: number; target2: number; rrRatio: string } {
  const stopDistance = atr * 1.5;
  const target1Distance = stopDistance * rrTarget;
  const target2Distance = stopDistance * (rrTarget * 1.5);

  if (direction === "STRONG_BUY" || direction === "BUY") {
    return {
      stopLoss: entry - stopDistance,
      target1: entry + target1Distance,
      target2: entry + target2Distance,
      rrRatio: `1:${rrTarget.toFixed(1)}`,
    };
  } else {
    return {
      stopLoss: entry + stopDistance,
      target1: entry - target1Distance,
      target2: entry - target2Distance,
      rrRatio: `1:${rrTarget.toFixed(1)}`,
    };
  }
}

/**
 * Phase 1: Build a signal from available free data (Layers 3, 4, partial 2)
 * Phase 2: Add Polygon.io (Layer 1) and full technicals
 */
export function buildSignal(
  symbol: string,
  timeframe: string,
  layerScores: LayerScore[],
  entry?: number
): ConfluenceSignal {
  const totalScore = calculateWeightedScore(layerScores);
  const direction = getSignalDirection(totalScore);

  return {
    symbol,
    timeframe,
    timestamp: new Date().toISOString(),
    totalScore,
    direction,
    layers: layerScores,
    entry,
    newsBlackout: false, // TODO: integrate economic calendar in Phase 2
    confidence: totalScore >= 75 || totalScore <= 25 ? "high" : totalScore >= 55 || totalScore <= 45 ? "medium" : "low",
  };
}
