import { describe, expect, it } from "vitest";
import {
  CELL_BORDER_HINT_PX,
  CELL_BORDER_SNAP_PX,
  landOnCellBorder,
  nearestHorizontalCellBorder,
  nearestVerticalCellBorder,
} from "./cellBorderGuideHelper";

const cellW = 16;
const cellH = 32;
const cols = 10;
const rows = 8;

describe("nearestVerticalCellBorder", () => {
  it("rounds to the nearest column edge", () => {
    expect(nearestVerticalCellBorder(3 * cellW + 2, cellW, cols)).toBe(
      3 * cellW,
    );
    expect(nearestVerticalCellBorder(3 * cellW + 10, cellW, cols)).toBe(
      4 * cellW,
    );
  });
});

describe("nearestHorizontalCellBorder", () => {
  it("rounds to the nearest row edge", () => {
    expect(nearestHorizontalCellBorder(2 * cellH + 3, cellH, rows)).toBe(
      2 * cellH,
    );
    expect(nearestHorizontalCellBorder(2 * cellH + 20, cellH, rows)).toBe(
      3 * cellH,
    );
  });
});

describe("landOnCellBorder", () => {
  it("shows a guide without snapping when only near a border", () => {
    const x = 4 * cellW + CELL_BORDER_HINT_PX - 1;
    const y = 2 * cellH + cellH / 4;
    const { point, guide } = landOnCellBorder(
      { x, y },
      cellW,
      cellH,
      cols,
      rows,
    );
    expect(guide.x).toBe(4 * cellW);
    expect(guide.y).toBeNull();
    expect(guide.snappedX).toBe(false);
    expect(point.x).toBe(x);
    expect(point.y).toBe(y);
  });

  it("snaps onto the indicated border inside the snap radius", () => {
    const x = 4 * cellW + CELL_BORDER_SNAP_PX - 0.5;
    const y = 2 * cellH + CELL_BORDER_SNAP_PX - 0.5;
    const { point, guide } = landOnCellBorder(
      { x, y },
      cellW,
      cellH,
      cols,
      rows,
    );
    expect(guide.x).toBe(4 * cellW);
    expect(guide.y).toBe(2 * cellH);
    expect(guide.snappedX).toBe(true);
    expect(guide.snappedY).toBe(true);
    expect(point).toEqual({ x: 4 * cellW, y: 2 * cellH });
  });

  it("leaves a point in the middle of a cell alone", () => {
    const x = 3 * cellW + cellW / 2;
    const y = 2 * cellH + cellH / 2;
    const { point, guide } = landOnCellBorder(
      { x, y },
      cellW,
      cellH,
      cols,
      rows,
    );
    expect(guide.x).toBeNull();
    expect(guide.y).toBeNull();
    expect(point).toEqual({ x, y });
  });
});
