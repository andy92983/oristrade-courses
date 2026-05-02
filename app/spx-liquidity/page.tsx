"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AuthGuard } from "../../components/auth/AuthGuard";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WallLevel    { price: number; size: number; side: "bid" | "ask"; }
interface BookSnapshot { walls: WallLevel[]; mid: number; }
interface TradePrint   { snapIdx: number; price: number; size: number; side: "buy" | "sell"; }

// ─── Layout constants ─────────────────────────────────────────────────────────
// Bookmap-style: chart fills left, right panel shows live depth
const AXIS_W  = 150;   // right panel: price + bid/ask depth columns
const HEAT_FRAC = 0.82; // heatmap = 82% of canvas height
const VOL_FRAC  = 0.09; // volume histogram = next 9%
// time axis = remaining 9%

// ─── Data constants ───────────────────────────────────────────────────────────
const MAX_SNAPS  = 800;
const MAX_TRADES = 1200;
const SNAP_MS    = 500;
const BASE_MID   = 5500;

const TIME_OPTS = [
  { label: "30s", snaps: 60  },
  { label: "1m",  snaps: 120 },
  { label: "2m",  snaps: 240 },
  { label: "5m",  snaps: 600 },
] as const;

const PRESETS = {
  Scalper:  { priceRange: 5,  minSize: 500, bubbleMult: 1.2 },
  Swing:    { priceRange: 10, minSize: 250, bubbleMult: 2.5 },
  Overview: { priceRange: 25, minSize: 100, bubbleMult: 1.8 },
  Full:     { priceRange: 50, minSize: 50,  bubbleMult: 1.5 },
} as const;
type PresetKey = keyof typeof PRESETS;

const NOW_FRAC = 0.95; // NOW line fixed at 95% — max history, minimal future gap

// ─── Persistent order-book simulator ─────────────────────────────────────────
// _book persists across ticks so walls form continuous horizontal heatmap bands.
// Two separate paths: snapBook (seed history, no cancels) vs tickBook (live, rare cancel).
const _book = new Map<number, WallLevel>();

function initBook(mid: number): void {
  _book.clear();
  const lo = Math.ceil((mid - 50) / 5) * 5;
  const hi = Math.floor((mid + 50) / 5) * 5;
  for (let p = lo; p <= hi; p += 5) {
    if (Math.abs(p - mid) < 1) continue;
    const side: "bid" | "ask" = p < mid ? "bid" : "ask";
    const r = Math.random();
    // 25pt levels: always. 10pt: 85%. 5pt: 65%. High initial coverage = solid bands.
    if      (p % 25 === 0)             _book.set(p, { price: p, size: Math.round(1800 + r * 3200), side });
    else if (p % 10 === 0 && r > 0.15) _book.set(p, { price: p, size: Math.round(400  + r * 1400), side });
    else if (r > 0.35)                 _book.set(p, { price: p, size: Math.round(100  + r * 600),  side });
  }
}

// Used for history seeding: NO cancellations, only gentle size oscillation.
// Keeps book fully populated so the 120-snapshot history looks solid.
function snapBook(mid: number): WallLevel[] {
  for (const w of _book.values()) {
    if (Math.random() < 0.12)
      w.size = Math.max(50, Math.round(w.size * (0.93 + Math.random() * 0.14)));
    w.side = w.price < mid ? "bid" : "ask"; // re-classify if mid drifted
  }
  return Array.from(_book.values()).map(w => ({ ...w }));
}

// Used for live ticks: very low cancel rate so walls persist many seconds.
function tickBook(mid: number): WallLevel[] {
  const lo = Math.ceil((mid - 50) / 5) * 5;
  const hi = Math.floor((mid + 50) / 5) * 5;

  for (const p of _book.keys()) {
    if (p < lo || p > hi) _book.delete(p); // out of range
  }

  for (const [p, w] of _book) {
    const r = Math.random();
    if      (r < 0.004) _book.delete(p);   // 0.4% cancel — wall lasts ~125 ticks ≈ 60s
    else if (r < 0.22)  w.size = Math.max(50, Math.round(w.size * (0.88 + Math.random() * 0.24)));
    // 78% no change per tick → clean horizontal bands
    w.side = w.price < mid ? "bid" : "ask";
  }

  // Re-populate cancelled or newly in-range levels
  for (let p = lo; p <= hi; p += 5) {
    if (Math.abs(p - mid) < 1 || _book.has(p)) continue;
    const prob = p % 25 === 0 ? 0.14 : p % 10 === 0 ? 0.06 : 0.022;
    if (Math.random() < prob) {
      const side: "bid" | "ask" = p < mid ? "bid" : "ask";
      const r = Math.random();
      const size = p % 25 === 0 ? 1800 + r * 3200
                 : p % 10 === 0 ? 400  + r * 1400
                 :                100  + r * 600;
      _book.set(p, { price: p, size: Math.round(size), side });
    }
  }

  // Clone so each snapshot owns independent wall objects
  return Array.from(_book.values()).map(w => ({ ...w }));
}

// live tick snapshot (with slow evolution + rare cancel)
function genSnapshot(mid: number): BookSnapshot {
  return { walls: tickBook(mid), mid };
}
// history seed snapshot (resize only, NO cancellations)
function seedSnapshot(mid: number): BookSnapshot {
  return { walls: snapBook(mid), mid };
}

function genTrade(mid: number, idx: number): TradePrint {
  const side: "buy" | "sell" = Math.random() > 0.48 ? "buy" : "sell";
  const offset = (0.25 + Math.random() * 3) * (side === "buy" ? 1 : -1);
  const price  = Math.round((mid + offset) * 4) / 4;
  const size   = Math.max(1, Math.round(Math.exp(Math.random() * 4.5)));
  return { snapIdx: idx, price, size, side };
}

// ─── Color helpers ────────────────────────────────────────────────────────────

// Log-scale intensity normalised over [minSize, 8000].
// Capped at 0.88 — no white-hot: bright cyan/gold is the maximum.
// Using 8000 as the reference ceiling means typical large walls (1k–5k)
// stay in the mid-bright range rather than washing out to white.
function wallAlpha(size: number, minSize: number): number {
  if (size < minSize) return 0;
  const lo = Math.log(Math.max(1, minSize));
  const hi = Math.log(8000);
  return Math.min(0.88, Math.max(0, (Math.log(size) - lo) / (hi - lo)));
}

// Bid / Demand — Dark Teal #134e4a → Bright Cyan #22d3ee (no white-hot).
// rgba alpha capped at 0.80 so heatmap is always semi-transparent over the background.
function bidColor(a: number): string {
  const t = Math.min(1, a / 0.88); // full-range ramp to bright cyan
  const r = Math.round(19  + t * (34  - 19));
  const g = Math.round(78  + t * (211 - 78));
  const b = Math.round(74  + t * (238 - 74));
  return `rgba(${r},${g},${b},${+(a * 0.80).toFixed(3)})`;
}

// Ask / Supply — Dark Brown #3d2b1f → Bright Gold #fcd34d (no white-hot).
function askColor(a: number): string {
  const t = Math.min(1, a / 0.88);
  const r = Math.round(61  + t * (252 - 61));
  const g = Math.round(43  + t * (211 - 43));
  const b = Math.round(31  + t * (77  - 31));
  return `rgba(${r},${g},${b},${+(a * 0.80).toFixed(3)})`;
}

// ─── 3D Ball renderer ────────────────────────────────────────────────────────
function drawBall3D(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number,
  bull: boolean, inten: number
) {
  // 1 — Drop shadow beneath ball
  const sh = ctx.createRadialGradient(x + r * 0.12, y + r * 0.55, r * 0.05,
                                       x + r * 0.08, y + r * 0.60, r * 1.15);
  sh.addColorStop(0, bull ? "rgba(0,120,50,0.40)" : "rgba(160,20,10,0.40)");
  sh.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sh;
  ctx.beginPath();
  ctx.ellipse(x + r * 0.08, y + r * 0.65, r * 0.88, r * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2 — Main sphere — radial gradient from upper-left highlight to dark edge
  const hx = x - r * 0.32;
  const hy = y - r * 0.32;
  const sphere = ctx.createRadialGradient(hx, hy, r * 0.04, x, y, r);
  if (bull) {
    sphere.addColorStop(0,    "rgba(255,255,255,0.92)");
    sphere.addColorStop(0.20, `rgba(${Math.round(80 + inten*40)},${Math.round(230+inten*25)},${Math.round(110+inten*40)},${0.72+inten*0.28})`);
    sphere.addColorStop(0.65, `rgba(${Math.round(20+inten*30)},${Math.round(150+inten*50)},${Math.round(55+inten*30)},0.92)`);
    sphere.addColorStop(1,    `rgba(0,${Math.round(45+inten*25)},${Math.round(12+inten*10)},0.97)`);
  } else {
    sphere.addColorStop(0,    "rgba(255,255,255,0.92)");
    sphere.addColorStop(0.20, `rgba(${Math.round(245+inten*10)},${Math.round(70+inten*25)},${Math.round(45+inten*15)},${0.72+inten*0.28})`);
    sphere.addColorStop(0.65, `rgba(${Math.round(180+inten*40)},${Math.round(22+inten*18)},${Math.round(12+inten*10)},0.92)`);
    sphere.addColorStop(1,    `rgba(${Math.round(60+inten*20)},0,0,0.97)`);
  }
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = sphere; ctx.fill();

  // 3 — Rim light — subtle opposite-side colour bleed
  const rim = ctx.createRadialGradient(x + r * 0.42, y + r * 0.42, r * 0.45,
                                        x + r * 0.35, y + r * 0.35, r);
  rim.addColorStop(0.65, "rgba(0,0,0,0)");
  rim.addColorStop(1,    bull ? "rgba(0,255,120,0.22)" : "rgba(255,60,30,0.22)");
  ctx.fillStyle = rim;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

  // 4 — Specular highlight spot (upper-left)
  const sx = x - r * 0.30;
  const sy = y - r * 0.30;
  const spec = ctx.createRadialGradient(sx - r * 0.04, sy - r * 0.04, 0, sx, sy, r * 0.24);
  spec.addColorStop(0,   "rgba(255,255,255,0.88)");
  spec.addColorStop(0.5, "rgba(255,255,255,0.30)");
  spec.addColorStop(1,   "rgba(255,255,255,0)");
  ctx.beginPath(); ctx.arc(sx, sy, r * 0.24, 0, Math.PI * 2);
  ctx.fillStyle = spec; ctx.fill();
}

// ─── Canvas render ────────────────────────────────────────────────────────────
interface RenderArgs {
  canvas:       HTMLCanvasElement;
  snapshots:    BookSnapshot[];
  trades:       TradePrint[];
  mid:          number;
  viewCenter:   number;
  priceRange:   number;
  minSize:      number;
  nowFrac:      number;
  visibleSnaps: number;
  bubbleMult:   number;
  hoverXY:      { x: number; y: number } | null;
}

function render(a: RenderArgs) {
  const { canvas, snapshots, trades, mid, viewCenter, priceRange,
          minSize, nowFrac, visibleSnaps, bubbleMult, hoverXY } = a;
  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.width  / dpr;
  const H   = canvas.height / dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  if (snapshots.length === 0) return;

  // ── Regions ──────────────────────────────────────────────────────────────────
  const chartW = W - AXIS_W;          // heatmap + time axis
  const heatH  = Math.floor(H * HEAT_FRAC);
  const volH   = Math.floor(H * VOL_FRAC);
  const timeH  = H - heatH - volH;

  const nowX   = chartW * nowFrac;

  // Price ↔ Y (heatmap)
  const p2y = (p: number) =>
    heatH * 0.5 - ((p - viewCenter) / priceRange) * (heatH * 0.5);
  // Band height: fills the cell when zoomed out (many levels on screen),
  // but capped at 10px so that each price level renders as a thin horizontal
  // lane rather than a thick block when zoomed in to Scalper/Swing ranges.
  // This is the Bookmap "price-bound lane" approach.
  const levelH = Math.max(2, Math.abs(p2y(viewCenter) - p2y(viewCenter + 5)));
  const halfH  = Math.min(levelH * 0.52, 10); // max 20px per band

  // Visible slice
  const visStart = Math.max(0, snapshots.length - visibleSnaps);
  const vis      = snapshots.slice(visStart);
  const lastSnap = vis[vis.length - 1] ?? snapshots[snapshots.length - 1];

  // colW based on ACTUAL data length so the latest snap always lands at nowX.
  // No whitespace gap between last data point and NOW line at any zoom level.
  const colW = nowX / Math.max(1, vis.length);

  // ── BACKGROUND ───────────────────────────────────────────────────────────────
  ctx.fillStyle = "#030D12";
  ctx.fillRect(0, 0, chartW, heatH);

  // Future zone: very faint gold hint — the chart is dark, not a bright block
  const fg = ctx.createLinearGradient(nowX, 0, chartW, 0);
  fg.addColorStop(0, "rgba(212,175,55,0.025)");
  fg.addColorStop(1, "rgba(3,13,18,0)");
  ctx.fillStyle = fg;
  ctx.fillRect(nowX, 0, chartW - nowX, heatH);

  // ── HORIZONTAL PRICE GRID ─────────────────────────────────────────────────
  const step = priceRange <= 10 ? 5 : priceRange <= 30 ? 10 : 25;
  const gLo  = Math.ceil((viewCenter - priceRange) / step) * step;
  for (let p = gLo; p <= viewCenter + priceRange; p += step) {
    const y = p2y(p);
    if (y < 0 || y > heatH) continue;
    const major = p % 25 === 0;
    ctx.strokeStyle = major ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.025)";
    ctx.lineWidth   = 1;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(chartW, y); ctx.stroke();
  }

  // ── VERTICAL TIME GRID ───────────────────────────────────────────────────────
  // Dashed vertical lines every ~30 columns
  const vGridInterval = Math.max(20, Math.round(visibleSnaps / 6));
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth   = 1;
  ctx.setLineDash([3, 6]);
  for (let i = vGridInterval; i < vis.length; i += vGridInterval) {
    const vx = i * colW;
    ctx.beginPath(); ctx.moveTo(vx, 0); ctx.lineTo(vx, heatH + volH); ctx.stroke();
  }
  ctx.setLineDash([]);

  // ── WALL BANDS — horizontal-run heatmap ──────────────────────────────────────
  // Rather than thin per-column rectangles (which look like vertical stripes),
  // we iterate each PRICE LEVEL and draw one wide gradient rectangle spanning
  // every consecutive run of snapshots that have a wall at that level.
  // Result: solid horizontal bands that fade from dim (past) to bright (NOW).

  // O(1) price lookup per snapshot
  const snapMaps = vis.map(snap => {
    const m = new Map<number, WallLevel>();
    for (const w of snap.walls) m.set(w.price, w);
    return m;
  });

  const loPrice = Math.ceil((viewCenter - priceRange) / 5) * 5;
  const hiPrice = Math.floor((viewCenter + priceRange) / 5) * 5;
  const nSnaps  = Math.max(1, vis.length - 1);

  for (let price = loPrice; price <= hiPrice; price += 5) {
    const y = p2y(price);
    if (y < -halfH * 2 || y > heatH + halfH * 2) continue;

    // Walk time axis, collect contiguous runs, draw each as one gradient rect.
    // Single-snapshot gaps (<500ms) are bridged by Lerp interpolation — no black voids.
    let runStart = -1;
    let runSide: "bid" | "ask" = "bid";

    for (let i = 0; i <= vis.length; i++) {
      const wall   = i < vis.length ? snapMaps[i].get(price) : undefined;
      const active = wall !== undefined && wall.size >= minSize;

      if (active && runStart === -1) {
        runStart = i;
        runSide  = wall.side;
      }

      if ((!active || i === vis.length) && runStart !== -1) {
        // Bridge single-snapshot gaps (1 snap = 500ms) — Lerp instead of void
        if (!active && i < vis.length - 1) {
          const nextWall = snapMaps[i + 1]?.get(price);
          if (nextWall !== undefined && nextWall.size >= minSize) continue;
        }

        const x1 = runStart * colW;
        const x2 = i       * colW;

        // Representative size: last snapshot in run (most current)
        const lastWall = snapMaps[i - 1].get(price);
        const baseAl   = wallAlpha(lastWall?.size ?? 0, minSize);

        if (baseAl > 0.015) {
          // Gentle exponential decay: history stays readable, recent data brightest.
          // exp(-1.5 * (1 - pos)) → oldest ≈ 0.22, mid-history ≈ 0.47, NOW = 1.0
          // This ensures historical continuity — the band is visible from when
          // the order was placed, not just from 70% through history.
          const f0 = Math.exp(-1.5 * (1 - runStart / nSnaps));
          const f1 = Math.exp(-1.5 * (1 - (i - 1) / nSnaps));
          const grad = ctx.createLinearGradient(x1, 0, x2, 0);
          if (runSide === "bid") {
            grad.addColorStop(0, bidColor(baseAl * f0));
            grad.addColorStop(1, bidColor(baseAl * f1));
          } else {
            grad.addColorStop(0, askColor(baseAl * f0));
            grad.addColorStop(1, askColor(baseAl * f1));
          }
          ctx.fillStyle = grad;
          ctx.fillRect(x1, y - halfH, x2 - x1, halfH * 2);
        }
        runStart = -1;
      }
    }
  }

  // ── PRICE LINE — 3-layer glow path ──────────────────────────────────────────
  // Layer order: wide/blurry halo → medium glow → sharp crisp line on top.
  // Drawn AFTER heatmap walls but BEFORE bubbles so bubbles always sit on top.
  if (vis.length > 1) {
    const buildPath = () => {
      ctx.beginPath();
      for (let i = 0; i < vis.length; i++) {
        const x = i * colW + colW / 2;
        const y = p2y(vis[i].mid);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
    };
    // 1 — Wide diffuse halo
    buildPath();
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth   = 6;
    ctx.shadowColor = "rgba(255,255,255,0.20)";
    ctx.shadowBlur  = 12;
    ctx.stroke();
    // 2 — Medium glow
    buildPath();
    ctx.strokeStyle = "rgba(255,255,255,0.40)";
    ctx.lineWidth   = 2.5;
    ctx.shadowColor = "rgba(255,255,255,0.50)";
    ctx.shadowBlur  = 6;
    ctx.stroke();
    // 3 — Crisp white core
    buildPath();
    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth   = 1;
    ctx.shadowBlur  = 0;
    ctx.stroke();
  }

  // ── DELTA BUBBLES on price line ───────────────────────────────────────────
  interface DE { buy: number; sell: number; }
  const dm = new Map<number, DE>();
  for (const t of trades) {
    const i = t.snapIdx - visStart;
    if (i < 0 || i >= vis.length) continue;
    const e = dm.get(t.snapIdx) ?? { buy: 0, sell: 0 };
    t.side === "buy" ? (e.buy += t.size) : (e.sell += t.size);
    dm.set(t.snapIdx, e);
  }

  // Z-axis priority: sort ascending by |delta| so large bubbles render on top
  const bubbleList: Array<{ i: number; delta: number; bull: boolean }> = [];
  for (const [si, e] of dm) {
    const i = si - visStart;
    if (i < 0 || i >= vis.length) continue;
    const delta = e.buy - e.sell;
    if (Math.abs(delta) < 3) continue;
    bubbleList.push({ i, delta, bull: delta > 0 });
  }
  bubbleList.sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta)); // small first → large on top

  // bubbleHits: used by hover hit-test below
  const bubbleHits: Array<{ x: number; y: number; r: number; delta: number; i: number }> = [];

  // ── Pass 1: Ambient Occlusion shadows ────────────────────────────────────────
  // For each bubble, cast a soft elliptical shadow onto the nearest liquidity
  // plane (wall band) within reach. This gives a sense of spatial depth —
  // how far the price is from the nearest buy/sell wall.
  for (const { i, delta } of bubbleList) {
    const bx = i * colW + colW / 2;
    const by = p2y(vis[i].mid);
    if (by < 2 || by > heatH - 2) continue;
    const absDelta = Math.abs(delta);
    const r = Math.min(40, Math.max(2, Math.sqrt(absDelta) * 0.5 * bubbleMult));
    const timeFade = Math.exp(-1.5 * (1 - i / Math.max(1, vis.length - 1)));

    // Find the nearest wall band within 60px in canvas coords (below or above)
    let shadowY = -1;
    let shadowDist = Infinity;
    const sm = snapMaps[i];
    if (sm) {
      for (const [, wall] of sm) {
        if (wall.size < minSize) continue;
        const wy = p2y(wall.price);
        const d  = Math.abs(wy - by);
        if (d > r * 0.8 && d < 60 && d < shadowDist) {
          shadowDist = d;
          shadowY    = wy;
        }
      }
    }
    if (shadowY < 0) continue; // no nearby wall — skip AO

    const aoOpacity = timeFade * 0.30 * Math.max(0, 1 - shadowDist / 55);
    ctx.save();
    ctx.globalAlpha = aoOpacity;
    const sg = ctx.createRadialGradient(bx, shadowY, 0, bx, shadowY, r * 1.6);
    sg.addColorStop(0,   "rgba(0,0,0,0.75)");
    sg.addColorStop(0.5, "rgba(0,0,0,0.30)");
    sg.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.ellipse(bx, shadowY, r * 1.6, r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Pass 2: 3D balls ─────────────────────────────────────────────────────────
  for (const { i, delta, bull } of bubbleList) {
    const x = i * colW + colW / 2;
    const y = p2y(vis[i].mid);
    if (y < 2 || y > heatH - 2) continue;
    const absDelta = Math.abs(delta);
    // √volume radius with per-preset multiplier: area ∝ volume, min 2px, max 40px
    const r        = Math.min(40, Math.max(2, Math.sqrt(absDelta) * 0.5 * bubbleMult));
    const inten    = Math.min(1, absDelta / 600);
    // Temporal transparency: older bubbles recede — same decay curve as heatmap bands
    const timeFade = Math.exp(-1.5 * (1 - i / Math.max(1, vis.length - 1)));

    // Collect hit area for hover detection
    bubbleHits.push({ x, y, r, delta, i });

    ctx.save();
    ctx.globalAlpha = timeFade;

    // Bloom / emissive glow for whale trades (>250 contracts)
    if (absDelta > 250) {
      ctx.shadowColor = bull ? "rgba(0,255,120,0.55)" : "rgba(255,60,30,0.55)";
      ctx.shadowBlur  = Math.min(24, r * 0.8);
    }

    drawBall3D(ctx, x, y, r, bull, inten);
    ctx.shadowBlur = 0;

    // White outline ring — maintains separation during high-volatility clustering
    ctx.beginPath(); ctx.arc(x, y, r + 0.6, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.30)";
    ctx.lineWidth = 0.8; ctx.stroke();

    ctx.restore();
  }

  // ── FUTURE WALL BANDS (projection zone) ─────────────────────────────────────
  // Project the current book state into the future zone (nowX → chartW).
  // Bright at NOW, fading right — these are the walls as they exist right now,
  // extended forward in time so you can see what liquidity lies ahead of price.
  if (lastSnap && chartW > nowX + 4) {
    const futW = chartW - nowX;
    for (const wall of lastSnap.walls) {
      if (wall.size < minSize) continue;
      const py = p2y(wall.price);
      if (py < -halfH * 2 || py > heatH + halfH * 2) continue;
      const al = wallAlpha(wall.size, minSize) * 0.60; // slightly dimmer — it's a projection
      if (al < 0.015) continue;
      const grad = ctx.createLinearGradient(nowX, 0, nowX + futW, 0);
      if (wall.side === "bid") {
        grad.addColorStop(0, bidColor(al));
        grad.addColorStop(1, bidColor(al * 0.12));
      } else {
        grad.addColorStop(0, askColor(al));
        grad.addColorStop(1, askColor(al * 0.12));
      }
      ctx.fillStyle = grad;
      ctx.fillRect(nowX, py - halfH, futW, halfH * 2);
    }
  }

  // ── LIQUIDITY PROJECTION LINES ───────────────────────────────────────────────
  // Dashed horizontal lines for walls ≥ 1 000 contracts — span full chart width
  // (past + future) so you can see exactly which price levels have heavy depth.
  if (lastSnap) {
    ctx.save();
    ctx.setLineDash([4, 7]);
    ctx.lineWidth = 1;
    for (const wall of lastSnap.walls) {
      if (wall.size < 1000) continue;
      const py = p2y(wall.price);
      if (py < 2 || py > heatH - 2) continue;
      const pal = Math.min(0.30, wallAlpha(wall.size, 1000) * 0.38);
      ctx.strokeStyle = wall.side === "bid"
        ? `rgba(34,211,238,${pal})`
        : `rgba(252,211,77,${pal})`;
      // Historical segment (solid-ish)
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(nowX, py); ctx.stroke();
      // Future segment (more open dash = clearly a projection)
      ctx.setLineDash([3, 10]);
      ctx.beginPath(); ctx.moveTo(nowX, py); ctx.lineTo(chartW, py); ctx.stroke();
      ctx.setLineDash([4, 7]);
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  // ── NOW LINE ─────────────────────────────────────────────────────────────────
  ctx.save();
  ctx.strokeStyle = "rgba(212,175,55,0.7)";
  ctx.lineWidth   = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(nowX, 0); ctx.lineTo(nowX, heatH + volH); ctx.stroke();
  ctx.restore();

  ctx.fillStyle   = "#D4AF37";
  ctx.font        = "bold 10px Inter, sans-serif";
  ctx.textAlign   = "center";
  ctx.fillText("NOW", nowX, 13);

  // Future time labels
  const futW = chartW - nowX;
  ctx.fillStyle = "rgba(212,175,55,0.28)";
  ctx.font      = "9px Inter, sans-serif";
  const spt = (visibleSnaps * SNAP_MS) / 1000;
  if (futW > 50)  ctx.fillText(`+${Math.round(spt*0.1)}s`, nowX + futW * 0.30, 13);
  if (futW > 90)  ctx.fillText(`+${Math.round(spt*0.2)}s`, nowX + futW * 0.62, 13);
  if (futW > 130) ctx.fillText(`+${Math.round(spt*0.3)}s`, nowX + futW * 0.91, 13);

  // ── VOLUME HISTOGRAM ─────────────────────────────────────────────────────────
  const vtop = heatH;
  ctx.fillStyle = "#020B0F";
  ctx.fillRect(0, vtop, chartW, volH);
  ctx.fillStyle = "#0A1520";
  ctx.fillRect(0, vtop, chartW, 1);

  // Max volume for scaling
  const volBySnap = new Map<number, { buy: number; sell: number }>();
  for (const t of trades) {
    const i = t.snapIdx - visStart;
    if (i < 0 || i >= vis.length) continue;
    const e = volBySnap.get(i) ?? { buy: 0, sell: 0 };
    t.side === "buy" ? (e.buy += t.size) : (e.sell += t.size);
    volBySnap.set(i, e);
  }
  let maxVol = 1;
  for (const v of volBySnap.values()) maxVol = Math.max(maxVol, v.buy + v.sell);

  for (const [i, v] of volBySnap) {
    const x    = i * colW;
    const tot  = v.buy + v.sell;
    const barH = Math.round((tot / maxVol) * (volH - 4));
    const bull = v.buy >= v.sell;
    ctx.fillStyle = bull ? "rgba(60,200,100,0.7)" : "rgba(220,70,50,0.7)";
    ctx.fillRect(x, vtop + volH - barH, Math.max(1, colW - 0.5), barH);
  }

  // VOLUME label
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.font = "9px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("VOL", 4, vtop + 10);

  // ── TIME AXIS ────────────────────────────────────────────────────────────────
  const ttop = vtop + volH;
  ctx.fillStyle = "#020B0F";
  ctx.fillRect(0, ttop, chartW, timeH);
  ctx.fillStyle = "#0A1520";
  ctx.fillRect(0, ttop, chartW, 1);

  // Generate clock-like time labels based on real time
  const nowMs   = Date.now();
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font      = "9px Inter, sans-serif";
  ctx.textAlign = "center";
  for (let fi = 0; fi <= 5; fi++) {
    const frac   = fi / 5;
    const x      = frac * nowX;
    const msAgo  = (1 - frac) * visibleSnaps * SNAP_MS;
    const d      = new Date(nowMs - msAgo);
    const label  = `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}:${d.getSeconds().toString().padStart(2,"0")}`;
    ctx.fillText(label, x, ttop + timeH * 0.72);
  }

  // ── RIGHT PANEL — depth & price axis ─────────────────────────────────────────
  ctx.fillStyle = "#040F16";
  ctx.fillRect(chartW, 0, AXIS_W, H);
  ctx.fillStyle = "#0D1E28";
  ctx.fillRect(chartW, 0, 1, H);   // left border of panel

  // Column layout inside right panel:
  // price col: 0→55, bid col: 55→100, ask col: 100→150  (relative to chartW)
  const pCol  = chartW;
  const bCol  = chartW + 55;
  const aCol  = chartW + 100;

  // Column headers
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.font = "bold 8px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("BID", bCol + 22, 11);
  ctx.fillText("ASK", aCol + 25, 11);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(chartW, 14, AXIS_W, 1);

  // Build current book map from last snapshot
  const bookMap = new Map<number, { bid: number; ask: number }>();
  for (const wall of (lastSnap?.walls ?? [])) {
    const e = bookMap.get(wall.price) ?? { bid: 0, ask: 0 };
    wall.side === "bid" ? (e.bid = wall.size) : (e.ask = wall.size);
    bookMap.set(wall.price, e);
  }
  // Max size for depth bar scaling
  let maxDepth = 1;
  for (const e of bookMap.values()) maxDepth = Math.max(maxDepth, e.bid, e.ask);

  // Draw each price level row in the right panel
  const rowStep = priceRange <= 10 ? 5 : priceRange <= 30 ? 10 : 25;
  const rowLo   = Math.ceil((viewCenter - priceRange) / rowStep) * rowStep;

  for (let p = rowLo; p <= viewCenter + priceRange; p += rowStep) {
    const y = p2y(p);
    if (y < 16 || y > heatH - 4) continue;

    const entry  = bookMap.get(p);
    const bidSz  = entry?.bid ?? 0;
    const askSz  = entry?.ask ?? 0;
    const isMid  = Math.abs(p - mid) < rowStep * 0.6;
    const major  = p % 25 === 0;

    // Horizontal row separator
    ctx.fillStyle = major ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)";
    ctx.fillRect(chartW, y - 3, AXIS_W, 1);

    // Bid depth bar — color mirrors heatmap 4-tier scale
    if (bidSz > 0) {
      const bidAl = wallAlpha(bidSz, minSize);
      const bw = Math.max(2, Math.round((bidSz / maxDepth) * 40));
      ctx.fillStyle = bidColor(bidAl);
      ctx.fillRect(bCol, y - 5, bw, 10);
    }
    // Ask depth bar — color mirrors heatmap 4-tier scale
    if (askSz > 0) {
      const askAl = wallAlpha(askSz, minSize);
      const aw = Math.max(2, Math.round((askSz / maxDepth) * 40));
      ctx.fillStyle = askColor(askAl);
      ctx.fillRect(aCol, y - 5, aw, 10);
    }

    // Price label
    if (isMid) {
      ctx.fillStyle = "#D4AF37";
      ctx.fillRect(pCol + 1, y - 9, 53, 18);
      ctx.fillStyle = "#030D12";
      ctx.font = "bold 10px 'Courier New', monospace";
    } else {
      ctx.fillStyle = major ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.38)";
      ctx.font = major ? "bold 9px Inter, sans-serif" : "9px Inter, sans-serif";
    }
    ctx.textAlign = "right";
    ctx.fillText(p.toFixed(0), pCol + 52, y + 4);

    // Bid size number — colour matches heatmap tier (min 0.35 for text legibility)
    if (bidSz > 0) {
      ctx.fillStyle = bidColor(Math.max(0.35, wallAlpha(bidSz, minSize)));
      ctx.font = "8px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(bidSz >= 1000 ? `${(bidSz/1000).toFixed(1)}k` : String(bidSz), bCol + 48, y + 3);
    }
    // Ask size number — colour matches heatmap tier
    if (askSz > 0) {
      ctx.fillStyle = askColor(Math.max(0.35, wallAlpha(askSz, minSize)));
      ctx.font = "8px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(askSz >= 1000 ? `${(askSz/1000).toFixed(1)}k` : String(askSz), aCol + 48, y + 3);
    }
  }

  // ── LIVE PRICE MARKER — glowing horizontal extending full chart width ─────────
  // Anchored to the Y-axis price tag; moves as price moves. Much more prominent
  // than a simple dashed line — gives users a spatial reference for distance to walls.
  const midY = p2y(mid);
  if (midY > 0 && midY < heatH) {
    const pulse = 0.5 + 0.3 * Math.sin(Date.now() / 450);
    ctx.save();
    ctx.setLineDash([]);

    // Layer 1: wide diffuse halo across chart
    ctx.strokeStyle = `rgba(212,175,55,${(0.06 + pulse * 0.04).toFixed(3)})`;
    ctx.lineWidth   = 5;
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(nowX, midY); ctx.stroke();

    // Layer 2: crisp gold line
    ctx.strokeStyle = `rgba(212,175,55,${(0.45 + pulse * 0.15).toFixed(3)})`;
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(nowX, midY); ctx.stroke();

    // Layer 3: glowing dot at the NOW line edge — price is "here right now"
    const dotR = 3.5 + pulse * 0.8;
    ctx.shadowColor = "rgba(212,175,55,0.9)";
    ctx.shadowBlur  = 8 + pulse * 5;
    ctx.fillStyle   = "#D4AF37";
    ctx.beginPath(); ctx.arc(nowX, midY, dotR, 0, Math.PI * 2); ctx.fill();

    // Smaller dot at left edge — anchors the line to the price axis
    ctx.shadowBlur  = 4;
    ctx.fillStyle   = "rgba(212,175,55,0.6)";
    ctx.beginPath(); ctx.arc(chartW + 0.5, midY, 2.5, 0, Math.PI * 2); ctx.fill();

    ctx.shadowBlur  = 0;
    ctx.restore();
  }

  // ── HOVER CROSSHAIR + TOOLTIP ─────────────────────────────────────────────
  if (hoverXY && hoverXY.x > 0 && hoverXY.x < chartW && hoverXY.y > 0 && hoverXY.y < heatH) {
    const hx = hoverXY.x;
    const hy = hoverXY.y;
    const hp = viewCenter - ((hy - heatH * 0.5) / (heatH * 0.5)) * priceRange;
    const sp = Math.round(hp / 5) * 5;

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth   = 1; ctx.setLineDash([3, 5]);
    ctx.beginPath(); ctx.moveTo(0, hy); ctx.lineTo(chartW, hy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx, 0); ctx.lineTo(hx, heatH); ctx.stroke();
    ctx.restore();

    // ── Bubble hit-test: bubbles take priority over wall labels ───────────────
    // Check largest bubbles first (sorted descending) so the most prominent one wins.
    let hitBubble: (typeof bubbleHits)[number] | null = null;
    for (let bi = bubbleHits.length - 1; bi >= 0; bi--) {
      const bh = bubbleHits[bi];
      if (Math.hypot(hx - bh.x, hy - bh.y) <= bh.r + 4) {
        hitBubble = bh;
        break;
      }
    }

    let l1: string, l2: string, tc: string;
    if (hitBubble) {
      // Bubble tooltip: direction, delta contracts, precise timestamp
      const msAgo = (vis.length - 1 - hitBubble.i) * SNAP_MS;
      const d     = new Date(Date.now() - msAgo);
      const ts    = `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}:${d.getSeconds().toString().padStart(2,"0")}`;
      const bull  = hitBubble.delta > 0;
      l1 = `${bull ? "▲ BUY" : "▼ SELL"}  Δ${Math.abs(hitBubble.delta).toLocaleString()} lots`;
      l2 = `@ ${ts}`;
      tc = bull ? "#4ADE80" : "#F87171";
    } else {
      // Wall tooltip
      let bw: WallLevel | null = null, bd = Infinity;
      for (const w of (lastSnap?.walls ?? [])) {
        const d = Math.abs(w.price - sp);
        if (d < bd) { bd = d; bw = w; }
      }
      const hasW = bw && bd <= 7 && bw.size >= minSize;
      l1 = hasW ? `${bw!.side === "bid" ? "BID" : "ASK"} @ ${bw!.price.toFixed(0)}` : hp.toFixed(2);
      l2 = hasW ? `${bw!.size.toLocaleString()} contracts` : "";
      tc = hasW ? (bw!.side === "bid" ? "#38BDF8" : "#FB923C") : "rgba(255,255,255,0.7)";
    }

    ctx.setLineDash([]);
    ctx.font = "bold 10px Inter, sans-serif";
    const tw = Math.max(ctx.measureText(l1).width, l2 ? ctx.measureText(l2).width : 0) + 20;
    const th = l2 ? 36 : 22;
    let tx = hx + 12; let ty = hy - th / 2;
    if (tx + tw > chartW - 4) tx = hx - tw - 12;
    ty = Math.max(4, Math.min(heatH - th - 4, ty));

    ctx.fillStyle   = "rgba(2,11,15,0.95)";
    ctx.strokeStyle = hitBubble ? tc + "55" : "rgba(212,175,55,0.4)";
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.roundRect(tx, ty, tw, th, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = tc; ctx.textAlign = "left";
    ctx.fillText(l1, tx + 9, ty + 13);
    if (l2) {
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "9px Inter, sans-serif";
      ctx.fillText(l2, tx + 9, ty + 27);
    }
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
function Inner() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const snapsRef   = useRef<BookSnapshot[]>([]);
  const tradesRef  = useRef<TradePrint[]>([]);
  const snapIdxRef = useRef(0);
  const midRef     = useRef(BASE_MID);
  const rafRef     = useRef(0);
  const hoverRef   = useRef<{ x: number; y: number } | null>(null);
  const dragRef    = useRef<{ y: number; center: number } | null>(null);
  const prRangeRef = useRef<number>(PRESETS.Swing.priceRange);

  const [preset,       setPreset]       = useState<PresetKey>("Swing");
  const [minSize,      setMinSize]      = useState(250);
  const [bubbleMult,   setBubbleMult]   = useState<number>(PRESETS.Swing.bubbleMult);
  const [viewCenter,   setViewCenter]   = useState(BASE_MID);
  const [priceRange,   setPriceRange]   = useState<number>(PRESETS.Swing.priceRange);
  const [nowFrac,      setNowFrac]      = useState(NOW_FRAC);
  const [visibleSnaps, setVisibleSnaps] = useState(120);
  const [showGuide,    setShowGuide]    = useState(false);
  const [isLive,       setIsLive]       = useState(false);

  useEffect(() => { prRangeRef.current = priceRange; }, [priceRange]);

  // ── Canvas resize ───────────────────────────────────────────────────────────
  const syncSize = useCallback(() => {
    const c = canvasRef.current; const w = wrapRef.current;
    if (!c || !w) return;
    const dpr = window.devicePixelRatio || 1;
    const cw = w.clientWidth; const ch = w.clientHeight;
    if (c.width !== cw * dpr || c.height !== ch * dpr) {
      c.width = cw * dpr; c.height = ch * dpr;
      c.style.width = `${cw}px`; c.style.height = `${ch}px`;
    }
  }, []);

  // ── RAF loop ────────────────────────────────────────────────────────────────
  const loop = useCallback(() => {
    const c = canvasRef.current;
    if (c) {
      syncSize();
      render({ canvas: c, snapshots: snapsRef.current, trades: tradesRef.current,
               mid: midRef.current, viewCenter, priceRange, minSize, nowFrac,
               visibleSnaps, bubbleMult, hoverXY: hoverRef.current });
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [viewCenter, priceRange, minSize, visibleSnaps, bubbleMult, nowFrac, syncSize]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  // ── Native wheel (non-passive) ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const handler = (e: WheelEvent) => {
      const r = canvas.getBoundingClientRect();
      const rx = e.clientX - r.left;
      if (rx < 0 || rx > r.width) return;
      e.preventDefault();

      // Hover over price axis (right panel) → vertical zoom (price range)
      // Hover over chart area → horizontal zoom (time / visible history)
      const chartW = r.width - AXIS_W;
      if (rx >= chartW) {
        const factor = e.deltaY > 0 ? 1.07 : 0.94;
        setPriceRange(p => Math.max(3, Math.min(100, p * factor)));
      } else {
        const factor = e.deltaY > 0 ? 1.10 : 0.91;
        setVisibleSnaps(v => Math.max(30, Math.min(MAX_SNAPS, Math.round(v * factor))));
      }
    };
    canvas.addEventListener("wheel", handler, { passive: false });
    return () => canvas.removeEventListener("wheel", handler);
  }, []);

  // ── Simulation (runs once) ──────────────────────────────────────────────────
  useEffect(() => {
    snapsRef.current = []; tradesRef.current = [];
    snapIdxRef.current = 0; midRef.current = BASE_MID;
    initBook(BASE_MID); // fully populate book before seeding history
    for (let i = 0; i < 120; i++) {
      midRef.current = Math.round((midRef.current + (Math.random() - 0.49) * 0.5) * 4) / 4;
      // seedSnapshot: no cancellations — book stays fully populated for clean history
      snapsRef.current.push(seedSnapshot(midRef.current));
      snapIdxRef.current++;
    }
    setViewCenter(midRef.current);
    const iv = setInterval(() => {
      midRef.current = Math.round((midRef.current + (Math.random() - 0.49) * 0.5) * 4) / 4;
      snapsRef.current.push(genSnapshot(midRef.current));
      if (snapsRef.current.length > MAX_SNAPS) snapsRef.current.shift();
      const n = Math.floor(Math.random() * 4);
      for (let i = 0; i < n; i++)
        tradesRef.current.push(genTrade(midRef.current, snapIdxRef.current));
      if (tradesRef.current.length > MAX_TRADES)
        tradesRef.current.splice(0, tradesRef.current.length - MAX_TRADES);
      snapIdxRef.current++;
    }, SNAP_MS);
    return () => clearInterval(iv);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Resize observer ─────────────────────────────────────────────────────────
  useEffect(() => {
    const obs = new ResizeObserver(() => syncSize());
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, [syncSize]);

  // ── Preset ──────────────────────────────────────────────────────────────────
  function applyPreset(k: PresetKey) {
    setPreset(k);
    setMinSize(PRESETS[k].minSize);
    setPriceRange(PRESETS[k].priceRange);
    setBubbleMult(PRESETS[k].bubbleMult);
  }

  // ── Mouse ────────────────────────────────────────────────────────────────────
  const getPos = (e: React.MouseEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const pos = getPos(e);
    hoverRef.current = pos;
    if (dragRef.current) {
      const dy    = pos.y - dragRef.current.y;
      const H     = (canvasRef.current?.height ?? 600) / (window.devicePixelRatio || 1);
      const delta = (dy / (H * HEAT_FRAC)) * priceRange * 2;
      // + delta: drag down → viewCenter increases → price line moves down (natural)
      setViewCenter(dragRef.current.center + delta);
    }
  }, [priceRange]);
  const onMouseDown  = useCallback((e: React.MouseEvent) => {
    dragRef.current = { y: getPos(e).y, center: viewCenter };
  }, [viewCenter]);
  const onMouseUp    = useCallback(() => { dragRef.current = null; }, []);
  const onMouseLeave = useCallback(() => { dragRef.current = null; hoverRef.current = null; }, []);
  const onDblClick   = useCallback(() => { setViewCenter(midRef.current); }, []);

  // ── Toolbar style ────────────────────────────────────────────────────────────
  const tb = (active: boolean) =>
    `px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer transition-colors ${
      active ? "bg-[#D4AF37] text-[#030D12] font-bold"
             : "text-[#4A6070] hover:text-[#8AABBE] hover:bg-[#0D1E28]"
    }`;
  const sep = "w-px h-4 bg-[#0D1E28] self-center mx-1";

  return (
    <div className="flex flex-col bg-[#020B0F] text-white select-none"
         style={{ height: "100dvh", overflow: "hidden" }}>

      {/* ── TOOLBAR ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-3 py-1 bg-[#020B0F] border-b border-[#0D1E28] flex-shrink-0 flex-wrap">

        <span className="text-[#22d3ee] font-semibold text-sm tracking-wide mr-2">SPX Liquidity Chart</span>
        <div className={sep} />

        <div className="flex items-center gap-0.5">
          <button className={tb(!isLive)} onClick={() => setIsLive(false)}>Demo</button>
          <button className={tb(isLive)} onClick={() => setIsLive(true)}>
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-green-400 animate-pulse" : "bg-[#1A2D3A]"}`} />
              Live
            </span>
          </button>
        </div>
        <div className={sep} />

        <div className="flex items-center gap-0.5">
          <span className="text-[9px] text-[#1A2D3A] uppercase tracking-widest mr-0.5">PRESET</span>
          {(Object.keys(PRESETS) as PresetKey[]).map(k => (
            <button key={k} className={tb(preset === k)} onClick={() => applyPreset(k)}>{k}</button>
          ))}
        </div>
        <div className={sep} />

        <div className="flex items-center gap-0.5">
          <span className="text-[9px] text-[#1A2D3A] uppercase tracking-widest mr-0.5">FILTER</span>
          {[50, 100, 250, 500, 1000].map(s => (
            <button key={s} className={tb(minSize === s)} onClick={() => setMinSize(s)}>
              {s >= 1000 ? "1k+" : `${s}+`}
            </button>
          ))}
        </div>
        <div className={sep} />

        <div className="flex items-center gap-0.5">
          <span className="text-[9px] text-[#1A2D3A] uppercase tracking-widest mr-0.5">TIME</span>
          {TIME_OPTS.map(o => (
            <button key={o.label} className={tb(visibleSnaps === o.snaps)} onClick={() => setVisibleSnaps(o.snaps)}>
              {o.label}
            </button>
          ))}
        </div>
        <div className={sep} />

        <div className="flex items-center gap-0.5">
          <span className="text-[9px] text-[#1A2D3A] uppercase tracking-widest mr-0.5">NOW</span>
          {[0.40, 0.50, 0.60, 0.70, 0.80, 0.95].map(f => (
            <button key={f} className={tb(nowFrac === f)} onClick={() => setNowFrac(f)}>
              {Math.round(f * 100)}%
            </button>
          ))}
        </div>

        {/* Live price */}
        <div className="ml-auto font-mono text-xs text-[#D4AF37] border border-[#D4AF37]/25 bg-[#D4AF37]/5 px-2 py-0.5 rounded">
          SPX {midRef.current.toFixed(2)}
        </div>

        {/* Guide */}
        <button onClick={() => setShowGuide(g => !g)}
          className="text-[10px] text-[#2A3D4A] hover:text-[#8AABBE] border border-[#0D1E28] hover:border-[#1A2D3A] px-2 py-0.5 rounded transition-colors">
          {showGuide ? "Close ✕" : "Guide"}
        </button>
      </div>

      {/* ── GUIDE ─────────────────────────────────────────────────────────────── */}
      {showGuide && (
        <div className="absolute top-10 right-4 z-30 w-[300px] bg-[#020B0F]/96 border border-[#0D1E28] rounded-xl p-4 shadow-2xl backdrop-blur-md text-xs text-[#6A8DA0]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-white font-semibold">How to Read</span>
            <button onClick={() => setShowGuide(false)} className="text-[#3A5060] hover:text-white">✕</button>
          </div>
          <div className="space-y-2.5">
            {[
              { color:"rgba(0,200,220,0.8)",  label:"Cyan bands",    desc:"Bid walls — buy-side limit orders. Brighter = larger." },
              { color:"rgba(255,140,0,0.8)",   label:"Orange bands",  desc:"Ask walls — sell-side limit orders. Brighter = larger." },
              { color:"rgba(60,200,100,0.85)", label:"Green bubbles", desc:"Net buying pressure at that moment. Larger = stronger." },
              { color:"rgba(220,70,50,0.85)",  label:"Red bubbles",   desc:"Net selling pressure. Right panel shows live depth." },
            ].map(({ color, label, desc }) => (
              <div key={label} className="flex gap-2.5 items-start">
                <div className="w-8 h-3 rounded flex-shrink-0 mt-0.5" style={{ background: color }} />
                <p><span className="text-white font-medium">{label}:</span> {desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[#0D1E28] text-[#3A5060] space-y-0.5">
            <p><span className="text-[#6A8DA0]">Scroll</span> — zoom price range</p>
            <p><span className="text-[#6A8DA0]">Drag up/down</span> — pan price view</p>
            <p><span className="text-[#6A8DA0]">Double-click</span> — re-center on price</p>
          </div>
        </div>
      )}

      {/* ── CANVAS FRAME ─────────────────────────────────────────────────────── */}
      {/* Outer dark margin — bg-[#060C18] fills the flex space and creates the frame */}
      <div className="flex-1 min-h-0 bg-[#060C18] flex items-center justify-center overflow-hidden">

        {/* Inner 90×90% chart container — rounded border + dual-layer shadow */}
        <div ref={wrapRef} className="relative overflow-hidden"
             style={{
               width: "90%", height: "90%",
               cursor: "crosshair",
               borderRadius: "8px",
               border: "1px solid rgba(20,50,70,0.7)",
               boxShadow: "0 2px 8px rgba(0,0,0,0.55), 0 12px 40px rgba(0,0,0,0.70)",
             }}
             onMouseMove={onMouseMove} onMouseDown={onMouseDown}
             onMouseUp={onMouseUp} onMouseLeave={onMouseLeave} onDoubleClick={onDblClick}>
          <canvas ref={canvasRef} className="block w-full h-full" style={{ borderRadius: "7px" }} />

          {/* Live/Demo badge */}
          <div className="absolute top-3 right-[158px] pointer-events-none">
            {isLive
              ? <span className="flex items-center gap-1.5 text-[10px] text-green-400 bg-green-900/25 border border-green-800/40 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> LIVE
                </span>
              : <span className="text-[10px] text-[#1A2D3A] bg-[#020B0F]/70 border border-[#0D1E28] px-2 py-0.5 rounded">DEMO</span>
            }
          </div>
        </div>

      </div>
    </div>
  );
}

export default function SPXLiquidityPage() {
  return (
    <AuthGuard requiredTier="starter">
      <Inner />
    </AuthGuard>
  );
}
