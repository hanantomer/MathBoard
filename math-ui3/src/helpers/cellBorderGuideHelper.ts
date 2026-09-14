import { DotCoordinates } from "common/baseTypes";

/** Show a guide when the pointer is this close to a cell border. */
export const CELL_BORDER_HINT_PX = 6;

/** Stick to the indicated border so the user can land on it. */
export const CELL_BORDER_SNAP_PX = 3;

export type CellBorderGuide = {
  x: number | null;
  y: number | null;
  snappedX: boolean;
  snappedY: boolean;
};

export const EMPTY_CELL_BORDER_GUIDE: CellBorderGuide = {
  x: null,
  y: null,
  snappedX: false,
  snappedY: false,
};

function clampToGrid(value: number, step: number, max: number): number {
  if (step <= 0) return value;
  const snapped = Math.round(value / step) * step;
  return Math.max(0, Math.min(max, snapped));
}

export function nearestVerticalCellBorder(
  x: number,
  cellW: number,
  cols: number,
): number {
  return clampToGrid(x, cellW, cols * cellW);
}

export function nearestHorizontalCellBorder(
  y: number,
  cellH: number,
  rows: number,
): number {
  return clampToGrid(y, cellH, rows * cellH);
}

/**
 * Nearby cell-border guides for a pointer in SVG user space.
 * Snaps the point only inside the small snap radius so the guide is visible
 * before the endpoint sticks.
 */
export function landOnCellBorder(
  point: DotCoordinates,
  cellW: number,
  cellH: number,
  cols: number,
  rows: number,
  hintPx = CELL_BORDER_HINT_PX,
  snapPx = CELL_BORDER_SNAP_PX,
): { point: DotCoordinates; guide: CellBorderGuide } {
  const gx = nearestVerticalCellBorder(point.x, cellW, cols);
  const gy = nearestHorizontalCellBorder(point.y, cellH, rows);
  const dx = Math.abs(gx - point.x);
  const dy = Math.abs(gy - point.y);
  const nearX = dx <= hintPx;
  const nearY = dy <= hintPx;
  const snappedX = dx <= snapPx;
  const snappedY = dy <= snapPx;

  return {
    point: {
      x: snappedX ? gx : point.x,
      y: snappedY ? gy : point.y,
    },
    guide: {
      x: nearX ? gx : null,
      y: nearY ? gy : null,
      snappedX,
      snappedY,
    },
  };
}
