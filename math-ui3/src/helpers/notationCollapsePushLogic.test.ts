import { describe, expect, it } from "vitest";
import {
  findNextRowBlock,
  nextMathRowsAreEmptyFrom,
  SPACE_MOVE_EMPTY_RUN,
} from "./notationCollapsePushLogic";

const ROWS = 80;

function occupied(...rows: number[]) {
  const set = new Set(rows);
  return (row: number) => set.has(row);
}

describe("findNextRowBlock", () => {
  it("skips leading empty rows then stops at the first gap", () => {
    expect(findNextRowBlock(0, occupied(2, 3, 5), ROWS)).toEqual({
      firstRow: 2,
      lastRow: 3,
    });
  });

  it("includes fromRow when that row is occupied", () => {
    expect(findNextRowBlock(2, occupied(2, 3, 4), ROWS)).toEqual({
      firstRow: 2,
      lastRow: 4,
    });
  });

  it("runs through the last row of the board", () => {
    expect(findNextRowBlock(78, occupied(78, 79), ROWS)).toEqual({
      firstRow: 78,
      lastRow: 79,
    });
  });

  it("returns no block when nothing is occupied", () => {
    expect(findNextRowBlock(0, occupied(), ROWS)).toEqual({
      firstRow: -1,
      lastRow: -1,
    });
  });
});

describe("nextMathRowsAreEmptyFrom", () => {
  it("treats the current row as irrelevant; only rows below count", () => {
    expect(nextMathRowsAreEmptyFrom(0, occupied(0), ROWS)).toBe(true);
  });

  it("is false when math sits inside the empty-run window", () => {
    expect(nextMathRowsAreEmptyFrom(0, occupied(0, 2), ROWS)).toBe(false);
  });

  it("is true when the next occupied row is past the empty-run window", () => {
    expect(
      nextMathRowsAreEmptyFrom(
        0,
        occupied(0, SPACE_MOVE_EMPTY_RUN + 1),
        ROWS,
      ),
    ).toBe(true);
  });

  it("is vacuously true at the last row", () => {
    expect(nextMathRowsAreEmptyFrom(ROWS - 1, occupied(ROWS - 1), ROWS)).toBe(
      true,
    );
  });
});
