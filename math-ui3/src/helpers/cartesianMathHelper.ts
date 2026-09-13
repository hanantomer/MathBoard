import type {
  DotCoordinates,
  LineNotationAttributes,
  NotationAttributes,
} from "common/baseTypes";

const MINUS = "\u2212";

function isHorizontalAxis(line: LineNotationAttributes): boolean {
  return line.p1y === line.p2y && line.arrowRight === true;
}

function isVerticalAxis(line: LineNotationAttributes): boolean {
  return line.p1x === line.p2x && line.arrowLeft === true;
}

/** Axis intersections: horizontal `arrowRight` + vertical `arrowLeft`. */
export function cartesianOrigins(
  notations: NotationAttributes[],
): DotCoordinates[] {
  const lines = notations.filter(
    (n) => n.notationType === "LINE",
  ) as LineNotationAttributes[];
  const horizontals = lines.filter(isHorizontalAxis);
  const verticals = lines.filter(isVerticalAxis);
  const origins: DotCoordinates[] = [];
  for (const h of horizontals) {
    for (const v of verticals) {
      origins.push({ x: v.p1x, y: h.p1y });
    }
  }
  return origins;
}

export function nearestCartesianOrigin(
  point: DotCoordinates,
  origins: DotCoordinates[],
): DotCoordinates | null {
  if (!origins.length) return null;
  let best = origins[0];
  let bestD = Math.hypot(point.x - best.x, point.y - best.y);
  for (let i = 1; i < origins.length; i++) {
    const d = Math.hypot(point.x - origins[i].x, point.y - origins[i].y);
    if (d < bestD) {
      best = origins[i];
      bestD = d;
    }
  }
  return best;
}

/** Same snap as parabola placement so the readout matches the click. */
export function snapSvgToHalfCell(
  point: DotCoordinates,
  cellW: number,
  cellH: number,
): DotCoordinates {
  const w = (cellW || 1) / 2;
  const h = (cellH || 1) / 2;
  return {
    x: Math.round(point.x / w) * w,
    y: Math.round(point.y / h) * h,
  };
}

/** Board SVG pixels → math plane (y up) relative to an axis origin. */
export function svgPointToMath(
  px: number,
  py: number,
  origin: DotCoordinates,
  cellW: number,
  cellH: number,
): DotCoordinates | null {
  if (cellW <= 0 || cellH <= 0) return null;
  return {
    x: (px - origin.x) / cellW,
    y: (origin.y - py) / cellH,
  };
}

function formatMathCoord(n: number): string {
  const s = n.toFixed(1);
  return s.startsWith("-") ? MINUS + s.slice(1) : s;
}

export function formatMathPoint(x: number, y: number): string {
  return `(${formatMathCoord(x)}, ${formatMathCoord(y)})`;
}

/** Live status string, or empty when there are no axes / invalid cells. */
export function cartesianMathReadout(
  svgPoint: DotCoordinates,
  notations: NotationAttributes[],
  cellW: number,
  cellH: number,
): string {
  if (cellW <= 0 || cellH <= 0) return "";
  const origins = cartesianOrigins(notations);
  if (!origins.length) return "";
  const snapped = snapSvgToHalfCell(svgPoint, cellW, cellH);
  const origin = nearestCartesianOrigin(snapped, origins);
  if (!origin) return "";
  const math = svgPointToMath(snapped.x, snapped.y, origin, cellW, cellH);
  if (!math) return "";
  return formatMathPoint(math.x, math.y);
}
