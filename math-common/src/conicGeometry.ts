import type {
  ConicAttributes,
  ConicAxis,
  ConicKind,
  DotCoordinates,
} from "./baseTypes";

export const DEFAULT_PARABOLA_HALF_WIDTH = 20;
export const CONIC_SAMPLE_SPAN = 110;
export const CONIC_SAMPLE_STEPS = 56;
/** Pixels of each hyperbola branch past the vertex. Kept small; stretch with handles. */
export const HYPERBOLA_BRANCH_EXTENSION = 24;
const EPS = 1e-6;
const MIN_ARM = 8;
const MIN_SPAN = 24;
const MAX_SPAN = 360;

function roundPoint(x: number, y: number): DotCoordinates {
  return { x: Math.round(x), y: Math.round(y) };
}

function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

/** Vertical: y = hy + a (x-hx)^2. Horizontal: x = hx + a (y-hy)^2. */
export function conicFromVertexAndPoint(
  kind: ConicKind,
  hx: number,
  hy: number,
  px: number,
  py: number,
): ConicAttributes {
  if (kind === "hyperbola") {
    return hyperbolaFromCenterAndVertex(hx, hy, px, py);
  }
  return parabolaFromVertexAndPoint(hx, hy, px, py);
}

/** Compact vertical parabola at (hx, hy), opening toward the top of the board. */
export function defaultParabolaAt(hx: number, hy: number): ConicAttributes {
  return parabolaFromVertexAndPoint(
    hx,
    hy,
    hx + MIN_SPAN + 12,
    hy - 2 * DEFAULT_PARABOLA_HALF_WIDTH,
  );
}

/** Compact horizontal hyperbola centered at (hx, hy). */
export function defaultHyperbolaAt(hx: number, hy: number): ConicAttributes {
  return hyperbolaFromCenterAndVertex(
    hx,
    hy,
    hx + 2 * DEFAULT_PARABOLA_HALF_WIDTH,
    hy,
  );
}

export function defaultConicAt(
  kind: ConicKind,
  hx: number,
  hy: number,
): ConicAttributes {
  return kind === "hyperbola"
    ? defaultHyperbolaAt(hx, hy)
    : defaultParabolaAt(hx, hy);
}

/**
 * Unique vertical parabola through three points: y = A x² + B x + C,
 * stored as vertex form y = hy + a (x - hx)². Null if x’s repeat or points
 * are collinear (a line, not a parabola).
 */
export function parabolaFromThreePoints(
  p1: DotCoordinates,
  p2: DotCoordinates,
  p3: DotCoordinates,
): ConicAttributes | null {
  const { x: x1, y: y1 } = p1;
  const { x: x2, y: y2 } = p2;
  const { x: x3, y: y3 } = p3;
  if (
    Math.abs(x1 - x2) < EPS ||
    Math.abs(x1 - x3) < EPS ||
    Math.abs(x2 - x3) < EPS
  ) {
    return null;
  }

  const det =
    x1 * x1 * (x2 - x3) - x2 * x2 * (x1 - x3) + x3 * x3 * (x1 - x2);
  if (Math.abs(det) < EPS) return null;

  const detA = y1 * (x2 - x3) - y2 * (x1 - x3) + y3 * (x1 - x2);
  const detB =
    x1 * x1 * (y2 - y3) - x2 * x2 * (y1 - y3) + x3 * x3 * (y1 - y2);
  const detC =
    x1 * x1 * (x2 * y3 - x3 * y2) -
    x2 * x2 * (x1 * y3 - x3 * y1) +
    x3 * x3 * (x1 * y2 - x2 * y1);

  const A = detA / det;
  const B = detB / det;
  const C = detC / det;
  if (
    !Number.isFinite(A) ||
    !Number.isFinite(B) ||
    !Number.isFinite(C) ||
    Math.abs(A) < EPS
  ) {
    return null;
  }

  const hx = -B / (2 * A);
  const hy = A * hx * hx + B * hx + C;
  if (!Number.isFinite(hx) || !Number.isFinite(hy)) return null;

  const b = Math.min(
    MAX_SPAN,
    Math.max(
      MIN_SPAN,
      Math.abs(x1 - hx),
      Math.abs(x2 - hx),
      Math.abs(x3 - hx),
    ),
  );
  return {
    kind: "parabola",
    hx,
    hy,
    axis: "vertical",
    a: A,
    b,
    through: [p1, p2, p3],
  };
}

export function parabolaFromVertexAndPoint(
  hx: number,
  hy: number,
  px: number,
  py: number,
): ConicAttributes {
  const dx = px - hx;
  const dy = py - hy;
  const vertical = Math.abs(dy) >= Math.abs(dx);
  if (vertical) {
    const w = Math.abs(dx) < 8 ? DEFAULT_PARABOLA_HALF_WIDTH : dx;
    const a = dy / (w * w);
    return {
      kind: "parabola",
      hx,
      hy,
      axis: "vertical",
      a: finiteOr(a, 0),
      b: Math.abs(w),
    };
  }
  const h = Math.abs(dy) < 8 ? DEFAULT_PARABOLA_HALF_WIDTH : dy;
  const a = dx / (h * h);
  return {
    kind: "parabola",
    hx,
    hy,
    axis: "horizontal",
    a: finiteOr(a, 0),
    b: Math.abs(h),
  };
}

export function hyperbolaFromCenterAndVertex(
  hx: number,
  hy: number,
  px: number,
  py: number,
): ConicAttributes {
  const dx = px - hx;
  const dy = py - hy;
  const horizontal = Math.abs(dx) >= Math.abs(dy);
  if (horizontal) {
    const a = Math.abs(dx) < 8 ? DEFAULT_PARABOLA_HALF_WIDTH : dx;
    return {
      kind: "hyperbola",
      hx,
      hy,
      axis: "horizontal",
      a,
      b: Math.abs(a),
    };
  }
  const a = Math.abs(dy) < 8 ? DEFAULT_PARABOLA_HALF_WIDTH : dy;
  return {
    kind: "hyperbola",
    hx,
    hy,
    axis: "vertical",
    a,
    b: Math.abs(a),
  };
}

export function hyperbolaBFromPoint(
  conic: ConicAttributes,
  px: number,
  py: number,
): number {
  const aAbs = Math.max(Math.abs(conic.a), 8);
  if (conic.axis === "horizontal") {
    const dx = px - conic.hx;
    const dy = py - conic.hy;
    if (Math.abs(dx) <= aAbs + EPS) {
      return Math.max(Math.abs(dy), 8);
    }
    const inner = (dx * dx) / (aAbs * aAbs) - 1;
    if (inner <= EPS) return Math.max(Math.abs(dy), 8);
    return Math.max(Math.abs(dy) / Math.sqrt(inner), 8);
  }
  const dx = px - conic.hx;
  const dy = py - conic.hy;
  const aAbsV = Math.max(Math.abs(conic.a), 8);
  if (Math.abs(dy) <= aAbsV + EPS) {
    return Math.max(Math.abs(dx), 8);
  }
  const inner = (dy * dy) / (aAbsV * aAbsV) - 1;
  if (inner <= EPS) return Math.max(Math.abs(dx), 8);
  return Math.max(Math.abs(dx) / Math.sqrt(inner), 8);
}

export function parabolaDrawnHalfSpan(conic: ConicAttributes): number {
  if (conic.kind === "parabola") {
    const stored = conic.b;
    if (stored != null && Number.isFinite(stored) && Math.abs(stored) >= MIN_ARM) {
      return Math.min(MAX_SPAN, Math.abs(stored));
    }
  }
  return parabolaSampleHalfSpan(conic.a);
}

export function conicMoveBy(
  conic: ConicAttributes,
  dx: number,
  dy: number,
): ConicAttributes {
  return {
    ...conic,
    hx: conic.hx + dx,
    hy: conic.hy + dy,
    through: conic.through?.map((p) => ({ x: p.x + dx, y: p.y + dy })),
  };
}

/** Change parabola width only; keep the arm height so the open handle stays put. */
export function parabolaScaleSizeFromPoint(
  conic: ConicAttributes,
  px: number,
  py: number,
): ConicAttributes {
  if (conic.kind !== "parabola") return conic;
  const oldSpan = Math.max(parabolaDrawnHalfSpan(conic), MIN_SPAN);
  let span =
    conic.axis === "vertical"
      ? Math.abs(px - conic.hx)
      : Math.abs(py - conic.hy);
  span = Math.min(MAX_SPAN, Math.max(MIN_SPAN, span));
  const rise = conic.a * oldSpan * oldSpan;
  return {
    ...conic,
    b: span,
    a: finiteOr(rise / (span * span), conic.a),
  };
}

/** Change parabola curvature `a` only; keep drawn width. */
export function parabolaOpenFromPoint(
  conic: ConicAttributes,
  px: number,
  py: number,
): ConicAttributes {
  if (conic.kind !== "parabola") return conic;
  const span = Math.max(parabolaDrawnHalfSpan(conic), MIN_SPAN);
  if (conic.axis === "vertical") {
    return {
      ...conic,
      a: finiteOr((py - conic.hy) / (span * span), conic.a),
    };
  }
  return {
    ...conic,
    a: finiteOr((px - conic.hx) / (span * span), conic.a),
  };
}

/**
 * Stretch a parabola through (px, py). When `lockAxis` is set, keep the
 * current orientation so the curve does not flip while sizing.
 */
export function parabolaScaleThroughPoint(
  conic: ConicAttributes,
  px: number,
  py: number,
  lockAxis: boolean,
): ConicAttributes {
  if (!lockAxis || conic.kind !== "parabola") {
    return parabolaFromVertexAndPoint(conic.hx, conic.hy, px, py);
  }
  if (conic.axis === "vertical") {
    let w = px - conic.hx;
    if (Math.abs(w) < MIN_ARM) {
      w = Math.sign(w || 1) * DEFAULT_PARABOLA_HALF_WIDTH;
    }
    return {
      ...conic,
      a: finiteOr((py - conic.hy) / (w * w), conic.a),
    };
  }
  let h = py - conic.hy;
  if (Math.abs(h) < MIN_ARM) {
    h = Math.sign(h || 1) * DEFAULT_PARABOLA_HALF_WIDTH;
  }
  return {
    ...conic,
    a: finiteOr((px - conic.hx) / (h * h), conic.a),
  };
}

/** Move a hyperbola's vertex; keep the opening `b`. */
export function hyperbolaScaleAFromPoint(
  conic: ConicAttributes,
  px: number,
  py: number,
): ConicAttributes {
  if (conic.axis === "horizontal") {
    let a = px - conic.hx;
    if (Math.abs(a) < MIN_ARM) {
      a = Math.sign(conic.a || 1) * MIN_ARM;
    }
    return { ...conic, a };
  }
  let a = py - conic.hy;
  if (Math.abs(a) < MIN_ARM) {
    a = Math.sign(conic.a || 1) * MIN_ARM;
  }
  return { ...conic, a };
}

/** Axis-height handle for a parabola; branch handle for a hyperbola. */
export function conicOpeningHandlePoint(conic: ConicAttributes): DotCoordinates {
  if (conic.kind === "parabola") {
    const span = parabolaDrawnHalfSpan(conic);
    const rise = conic.a * span * span;
    if (conic.axis === "vertical") {
      return roundPoint(conic.hx, conic.hy + rise);
    }
    return roundPoint(conic.hx + rise, conic.hy);
  }
  const { aAbs, bAbs } = hyperbolaParams(conic);
  const t = aAbs + HYPERBOLA_BRANCH_EXTENSION * 0.85;
  const inner = (t * t) / (aAbs * aAbs) - 1;
  const s = inner > 0 ? Math.sqrt(inner) : 0;
  const signA = conic.a >= 0 ? 1 : -1;
  if (conic.axis === "horizontal") {
    return roundPoint(conic.hx + signA * t, conic.hy + bAbs * s);
  }
  return roundPoint(conic.hx + bAbs * s, conic.hy + signA * t);
}

/** SVG y grows downward: vertical a < 0 opens toward the top of the board (math +y). */
export function parabolaOpensUp(conic: ConicAttributes): boolean {
  if (conic.kind !== "parabola") return false;
  if (conic.axis === "vertical") return conic.a < 0;
  return false;
}

export function conicScaleHandlePoint(conic: ConicAttributes): DotCoordinates {
  if (conic.kind === "hyperbola") {
    if (conic.axis === "horizontal") {
      return roundPoint(conic.hx + conic.a, conic.hy);
    }
    return roundPoint(conic.hx, conic.hy + conic.a);
  }
  const span = parabolaDrawnHalfSpan(conic);
  if (conic.axis === "vertical") {
    return roundPoint(conic.hx + span, conic.hy);
  }
  return roundPoint(conic.hx, conic.hy + span);
}

export function sampleConic(conic: ConicAttributes): DotCoordinates[] {
  if (conic.kind === "hyperbola") {
    return hyperbolaBranchPointLists(conic).flat();
  }
  return sampleParabola(conic);
}

function parabolaSampleHalfSpan(a: number): number {
  const aAbs = Math.abs(a);
  if (aAbs < EPS) return CONIC_SAMPLE_SPAN;
  const handleRise =
    aAbs * DEFAULT_PARABOLA_HALF_WIDTH * DEFAULT_PARABOLA_HALF_WIDTH;
  const maxAxis = Math.max(CONIC_SAMPLE_SPAN, handleRise);
  return Math.min(maxAxis, Math.sqrt(maxAxis / aAbs));
}

function sampleParabola(conic: ConicAttributes): DotCoordinates[] {
  const points: DotCoordinates[] = [];
  const span = parabolaDrawnHalfSpan(conic);
  const steps = CONIC_SAMPLE_STEPS;
  for (let i = 0; i <= steps; i++) {
    const t = -span + (2 * span * i) / steps;
    if (conic.axis === "vertical") {
      points.push({
        x: conic.hx + t,
        y: conic.hy + conic.a * t * t,
      });
    } else {
      points.push({
        x: conic.hx + conic.a * t * t,
        y: conic.hy + t,
      });
    }
  }
  return points;
}

function hyperbolaSampleSpan(aAbs: number): number {
  return aAbs + HYPERBOLA_BRANCH_EXTENSION;
}

function hyperbolaParams(conic: ConicAttributes): { aAbs: number; bAbs: number } {
  const aAbs = Math.max(Math.abs(conic.a), 8);
  const bAbs = Math.max(Math.abs(conic.b ?? aAbs), 8);
  return { aAbs, bAbs };
}

function hyperbolaBranchPointLists(conic: ConicAttributes): DotCoordinates[][] {
  const { aAbs, bAbs } = hyperbolaParams(conic);
  const span = hyperbolaSampleSpan(aAbs);
  const steps = Math.ceil(CONIC_SAMPLE_STEPS / 2);

  const makeBranch = (sign: 1 | -1): DotCoordinates[] => {
    const upper: DotCoordinates[] = [];
    const lower: DotCoordinates[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = aAbs + ((span - aAbs) * i) / steps;
      const inner = (t * t) / (aAbs * aAbs) - 1;
      const s = inner > 0 ? Math.sqrt(inner) : 0;
      if (conic.axis === "horizontal") {
        const x = conic.hx + sign * t;
        upper.push({ x, y: conic.hy - bAbs * s });
        lower.push({ x, y: conic.hy + bAbs * s });
      } else {
        const y = conic.hy + sign * t;
        upper.push({ x: conic.hx - bAbs * s, y });
        lower.push({ x: conic.hx + bAbs * s, y });
      }
    }
    return [...upper.reverse(), ...lower];
  };

  return [makeBranch(1), makeBranch(-1)];
}

function polylinePath(points: DotCoordinates[]): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  return (
    `M ${first.x} ${first.y}` + rest.map((p) => ` L ${p.x} ${p.y}`).join("")
  );
}

export function conicSvgPaths(conic: ConicAttributes): string[] {
  if (conic.kind === "parabola") {
    return [polylinePath(sampleParabola(conic))];
  }
  return hyperbolaBranchPaths(conic);
}

function hyperbolaBranchPaths(conic: ConicAttributes): string[] {
  return hyperbolaBranchPointLists(conic).map(polylinePath);
}

export function conicAsymptotePaths(conic: ConicAttributes): string[] {
  if (conic.kind !== "hyperbola") return [];
  const { aAbs, bAbs } = hyperbolaParams(conic);
  const span = hyperbolaSampleSpan(aAbs);
  const slope = bAbs / aAbs;
  if (conic.axis === "horizontal") {
    return [
      `M ${conic.hx - span} ${conic.hy - slope * span} L ${conic.hx + span} ${conic.hy + slope * span}`,
      `M ${conic.hx - span} ${conic.hy + slope * span} L ${conic.hx + span} ${conic.hy - slope * span}`,
    ];
  }
  return [
    `M ${conic.hx - slope * span} ${conic.hy - span} L ${conic.hx + slope * span} ${conic.hy + span}`,
    `M ${conic.hx + slope * span} ${conic.hy - span} L ${conic.hx - slope * span} ${conic.hy + span}`,
  ];
}

export function conicBoundingBox(conic: ConicAttributes): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  const pts = sampleConic(conic);
  if (pts.length === 0) {
    return { minX: conic.hx, maxX: conic.hx, minY: conic.hy, maxY: conic.hy };
  }
  let minX = pts[0].x;
  let maxX = pts[0].x;
  let minY = pts[0].y;
  let maxY = pts[0].y;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, maxX, minY, maxY };
}

function distPointToSeg(
  p: DotCoordinates,
  a: DotCoordinates,
  b: DotCoordinates,
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 < EPS) {
    const ex = p.x - a.x;
    const ey = p.y - a.y;
    return Math.hypot(ex, ey);
  }
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

export function distanceToConic(
  conic: ConicAttributes,
  p: DotCoordinates,
): number {
  const branches =
    conic.kind === "hyperbola"
      ? hyperbolaBranchPointLists(conic)
      : [sampleParabola(conic)];
  let best = Infinity;
  for (const pts of branches) {
    if (pts.length < 2) {
      best = Math.min(best, Math.hypot(p.x - conic.hx, p.y - conic.hy));
      continue;
    }
    for (let i = 1; i < pts.length; i++) {
      best = Math.min(best, distPointToSeg(p, pts[i - 1], pts[i]));
    }
  }
  return best;
}

export function formatConicDiagramLine(
  conic: ConicAttributes,
  origin: DotCoordinates | null,
  cellW: number,
  cellH: number,
): string {
  const opens =
    conic.kind === "parabola"
      ? parabolaOpensUp(conic)
        ? "up"
        : conic.axis === "vertical"
          ? "down"
          : conic.a >= 0
            ? "right"
            : "left"
      : conic.axis === "horizontal"
        ? "left-right"
        : "up-down";
  if (!origin || cellW <= 0 || cellH <= 0) {
    return `diagram: ${conic.kind} opens=${opens}`;
  }
  const h = (conic.hx - origin.x) / cellW;
  const k = (origin.y - conic.hy) / cellH;
  return `diagram: ${conic.kind} vertex≈(${h.toFixed(1)},${k.toFixed(1)}) opens=${opens}`;
}
