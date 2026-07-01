import { getStroke } from "perfect-freehand";
import { DotCoordinates, FreeSketchNotationAttributes } from "common/baseTypes";

export const OCR_STROKE_DEBOUNCE_MS = 400;
const PADDING = 24;
const CANVAS_SIZE = 256;

type Point = { x: number; y: number };

function getSvgPathFromStroke(points: Array<[number, number]>): string {
  if (!points.length) return "";
  return (
    points.reduce((path, [x, y], index) => {
      return index === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
    }, "") + " Z"
  );
}

function strokeToOutline(points: Point[]): Array<[number, number]> {
  if (points.length < 2) return [];

  let lastPoint: Point | null = null;
  const strokePoints = points.map((p) => {
    let pressure = 0.55;
    if (lastPoint) {
      const dist = Math.hypot(p.x - lastPoint.x, p.y - lastPoint.y);
      const speedFactor = Math.min(dist / 25, 1);
      pressure = Math.max(0.2, Math.min(1, 0.75 - speedFactor * 0.4));
    }
    lastPoint = p;
    return [p.x, p.y, pressure] as [number, number, number];
  });

  return getStroke(strokePoints, {
    size: 6,
    thinning: 0.18,
    smoothing: 0.9,
    streamline: 0.52,
    simulatePressure: true,
    last: true,
    start: { cap: true, taper: 0 },
    end: { cap: true, taper: 2 },
  });
}

export function getStrokesBoundingCenter(strokes: Point[][]): DotCoordinates {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const stroke of strokes) {
    for (const p of stroke) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
  }

  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
  };
}

/** Rasterize one or more sketch strokes to a PNG data URL for OCR. */
export function renderStrokesToImageBase64(strokes: Point[][]): {
  imageBase64: string;
  center: DotCoordinates;
} | null {
  const validStrokes = strokes.filter((s) => s.length >= 2);
  if (validStrokes.length === 0) {
    return null;
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const stroke of validStrokes) {
    for (const p of stroke) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
  }

  const contentWidth = Math.max(maxX - minX, 1);
  const contentHeight = Math.max(maxY - minY, 1);
  const scale = Math.min(
    (CANVAS_SIZE - PADDING * 2) / contentWidth,
    (CANVAS_SIZE - PADDING * 2) / contentHeight,
  );

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.fillStyle = "#000000";

  const offsetX =
    (CANVAS_SIZE - contentWidth * scale) / 2 - minX * scale;
  const offsetY =
    (CANVAS_SIZE - contentHeight * scale) / 2 - minY * scale;

  for (const stroke of validStrokes) {
    const outline = strokeToOutline(stroke).map(
      ([x, y]) =>
        [x * scale + offsetX, y * scale + offsetY] as [number, number],
    );
    if (!outline.length) continue;
    const path = new Path2D(getSvgPathFromStroke(outline));
    ctx.fill(path);
  }

  return {
    imageBase64: canvas.toDataURL("image/png"),
    center: getStrokesBoundingCenter(validStrokes),
  };
}

export type FreeSketchOcrReplacement = {
  sketch: FreeSketchNotationAttributes;
  symbol: string;
  placementCenter: DotCoordinates;
};

/** OCR each sketch in parallel; returns null unless every sketch produces a non-empty symbol. */
export async function recognizeFreeSketchesForReplacement(
  sketches: FreeSketchNotationAttributes[],
  recognize: (imageBase64: string) => Promise<string>,
): Promise<FreeSketchOcrReplacement[] | null> {
  const tasks = sketches.map(async (sketch) => {
    const points = (sketch.points ?? []).map((p) => ({ x: p.x, y: p.y }));
    if (points.length < 2) {
      return null;
    }

    const rendered = renderStrokesToImageBase64([points]);
    if (!rendered) {
      return null;
    }

    try {
      const symbol = (await recognize(rendered.imageBase64)).trim();
      if (!symbol) {
        return null;
      }
      return {
        sketch,
        symbol,
        placementCenter: rendered.center,
      };
    } catch {
      return null;
    }
  });

  const results = await Promise.all(tasks);
  if (results.some((result) => result === null)) {
    return null;
  }

  return results as FreeSketchOcrReplacement[];
}
