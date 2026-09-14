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

/** Board SVG pixels → math plane (y up) relative to an axis origin.
 * One Y unit is half a cell so it matches one column on X (2:1 cells).
 */
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
    y: (origin.y - py) / cartesianYStep(cellH),
  };
}

/** Default Cartesian axes: ±6 cols and ±3 rows is a pixel square on 2:1 cells. */
export const CARTESIAN_AXIS_HALF_COLS = 6;
export const CARTESIAN_AXIS_HALF_ROWS = 3;

/** Vertical math unit: half a cell, same pixel size as one X unit. */
export function cartesianYStep(cellH: number): number {
  return cellH / 2;
}

export type AxisTickLabel = {
  x: number;
  y: number;
  value: string;
};

export function formatAxisTick(n: number): string {
  if (n < 0) return MINUS + String(-n);
  return String(n);
}

function onBoard(x: number, y: number): boolean {
  return x >= 0 && y >= 0;
}

/**
 * Integer tick labels (no axis names) for a newly placed axis pair.
 * Both axes run −6..6. Coordinates are SVG user space; y increases down.
 */
export function cartesianAxisTickLabels(
  origin: DotCoordinates,
  cellW: number,
  cellH: number,
  halfCols = CARTESIAN_AXIS_HALF_COLS,
): AxisTickLabel[] {
  if (cellW <= 0 || cellH <= 0) return [];

  const labels: AxisTickLabel[] = [];
  const belowAxis = origin.y + 3;
  const leftOfAxis = origin.x - Math.round(cellW * 0.85);
  const yStep = cartesianYStep(cellH);

  for (let n = -halfCols; n <= halfCols; n++) {
    if (n === 0) continue;
    const tickX = origin.x + n * cellW;
    const shift = Math.round(cellW * (n < 0 ? 0.55 : 0.28));
    const x = Math.round(tickX - shift);
    const y = Math.round(belowAxis);
    if (onBoard(x, y)) labels.push({ x, y, value: formatAxisTick(n) });
  }

  for (let n = -halfCols; n <= halfCols; n++) {
    if (n === 0) continue;
    const tickY = origin.y - n * yStep;
    const x = Math.round(leftOfAxis);
    const y = Math.round(tickY - yStep * 0.28);
    if (onBoard(x, y)) labels.push({ x, y, value: formatAxisTick(n) });
  }

  const zero: AxisTickLabel = {
    x: Math.round(leftOfAxis),
    y: Math.round(belowAxis),
    value: "0",
  };
  if (onBoard(zero.x, zero.y)) labels.push(zero);

  return labels;
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
