import { describe, expect, it } from "vitest";
import {
  firstOccupiedCell,
  lastOccupiedCell,
  lastOccupiedColOnRow,
} from "./cellJumpLogic";
import type { NotationAttributes } from "common/baseTypes";

function symbol(col: number, row: number): NotationAttributes {
  return {
    uuid: `${row}-${col}`,
    parentUUId: "p",
    boardType: "LESSON",
    notationType: "SYMBOL",
    user: { uuid: "u" } as NotationAttributes["user"],
    col,
    row,
    value: "x",
  } as NotationAttributes;
}

function sqrt(fromCol: number, toCol: number, row: number): NotationAttributes {
  return {
    uuid: `sqrt-${row}`,
    parentUUId: "p",
    boardType: "LESSON",
    notationType: "SQRT",
    user: { uuid: "u" } as NotationAttributes["user"],
    fromCol,
    toCol,
    row,
  } as NotationAttributes;
}

function line(): NotationAttributes {
  return {
    uuid: "axis",
    parentUUId: "p",
    boardType: "LESSON",
    notationType: "LINE",
    user: { uuid: "u" } as NotationAttributes["user"],
    p1x: 0,
    p1y: 0,
    p2x: 400,
    p2y: 0,
  } as NotationAttributes;
}

describe("lastOccupiedColOnRow", () => {
  it("returns the rightmost math cell on that row", () => {
    expect(
      lastOccupiedColOnRow([symbol(2, 1), symbol(7, 1), symbol(4, 2)], 1),
    ).toBe(7);
  });

  it("includes sqrt span and ignores lines", () => {
    expect(
      lastOccupiedColOnRow([symbol(1, 3), sqrt(2, 6, 3), line()], 3),
    ).toBe(6);
  });

  it("returns null for an empty row", () => {
    expect(lastOccupiedColOnRow([symbol(2, 1)], 4)).toBeNull();
  });
});

describe("board occupied extremes", () => {
  it("finds first and last math cells", () => {
    const notations = [symbol(5, 4), symbol(1, 2), sqrt(8, 9, 2), symbol(3, 4)];
    expect(firstOccupiedCell(notations)).toEqual({ col: 1, row: 2 });
    expect(lastOccupiedCell(notations)).toEqual({ col: 5, row: 4 });
  });

  it("returns null when only geometry is present", () => {
    expect(firstOccupiedCell([line()])).toBeNull();
    expect(lastOccupiedCell([line()])).toBeNull();
  });
});
