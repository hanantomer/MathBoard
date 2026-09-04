import type { NotationAttributes, RectNotationAttributes } from "common/baseTypes";
import { describe, expect, it } from "vitest";
import {
  firstWorkRow,
  firstWorkRowWithFreeGutter,
  isPracticeGutterNotation,
  isPracticeLabelGutterCol,
  lastRowWithGutterPartId,
  nextFreePartRow,
  overlayGutterMarks,
  practiceWorkFromCol,
  rowForNewPartLabel,
} from "./practicePartLabelHelper";

function labelChip(row: number, value: string): RectNotationAttributes {
  return {
    uuid: `l-${row}-${value}`,
    parentUUId: "p",
    boardType: "PRACTICE",
    notationType: "TEXT",
    user: { uuid: "u" } as RectNotationAttributes["user"],
    fromCol: 0,
    toCol: 1,
    fromRow: row,
    toRow: row,
    value,
  };
}

function symbolOn(
  row: number,
  col: number,
  value: string,
): NotationAttributes {
  return {
    uuid: `s-${row}-${col}`,
    parentUUId: "p",
    boardType: "PRACTICE",
    notationType: "SYMBOL",
    user: { uuid: "u" } as NotationAttributes["user"],
    col,
    row,
    value,
    followsFraction: false,
  } as NotationAttributes;
}

describe("practice label gutter", () => {
  it("starts work at col 0; numbers sit outside the matrix", () => {
    expect(practiceWorkFromCol()).toBe(0);
    expect(isPracticeLabelGutterCol(0)).toBe(false);
    expect(isPracticeLabelGutterCol(1)).toBe(false);
    expect(isPracticeLabelGutterCol(2)).toBe(false);
  });

  it("treats 2-col and leftover 3-col chips as gutter labels", () => {
    expect(isPracticeGutterNotation(0, 1)).toBe(true);
    expect(isPracticeGutterNotation(1, 2)).toBe(true);
    expect(isPracticeGutterNotation(1, 3)).toBe(true);
    expect(isPracticeGutterNotation(3, 10)).toBe(false);
    expect(isPracticeGutterNotation(1, 8)).toBe(false);
  });

  it("stamps on the work row when the gutter is free", () => {
    const work = [symbolOn(1, 5, "2")];
    expect(firstWorkRowWithFreeGutter(work)).toBe(1);
    expect(rowForNewPartLabel(work)).toBe(1);
    expect(nextFreePartRow(work)).toBe(2);
  });

  it("finds the last gutter row for a part and the next empty row", () => {
    expect(nextFreePartRow([])).toBe(0);
    const notations = [
      labelChip(1, "(1)"),
      labelChip(4, "(2)"),
    ] as NotationAttributes[];
    expect(lastRowWithGutterPartId(notations, "1")).toBe(1);
    expect(lastRowWithGutterPartId(notations, "2")).toBe(4);
    expect(lastRowWithGutterPartId(notations, "3")).toBeNull();
    expect(nextFreePartRow(notations)).toBe(5);
    expect(nextFreePartRow([], { "1": 0 })).toBe(1);
    expect(nextFreePartRow([symbolOn(1, 5, "2")], { "1": 0 })).toBe(2);
  });

  it("draws (n) on unlabeled work after reload", () => {
    const work = [symbolOn(0, 0, "2"), symbolOn(0, 1, "(")];
    expect(firstWorkRow(work)).toBe(0);
    expect(firstWorkRowWithFreeGutter(work)).toBe(0);
    expect(overlayGutterMarks(work, "3")).toEqual([{ row: 0, id: "3" }]);
    expect(
      overlayGutterMarks(work, "3", { "3": 0 }),
    ).toEqual([{ row: 0, id: "3" }]);
    expect(overlayGutterMarks(work, "4", { "3": 0 })).toEqual([
      { row: 0, id: "3" },
      { row: 1, id: "4" },
    ]);
    expect(
      overlayGutterMarks(work, "3", { "1": 0, "3": 1 }),
    ).toEqual([
      { row: 0, id: "1" },
      { row: 1, id: "3" },
    ]);
  });

  it("does not let a later task replace (1) on row 0", () => {
    expect(overlayGutterMarks([], "2", { "1": 0 })).toEqual([
      { row: 0, id: "1" },
      { row: 1, id: "2" },
    ]);
    expect(nextFreePartRow([], { "1": 0 })).toBe(1);
  });

  it("still shows (n) when a TEXT chip is already on the work row", () => {
    const notations = [labelChip(0, "(1)"), symbolOn(0, 2, "2")];
    expect(overlayGutterMarks(notations, "1")).toEqual([{ row: 0, id: "1" }]);
  });

  it("shows the active task number even on an empty board", () => {
    expect(overlayGutterMarks([], "3")).toEqual([{ row: 0, id: "3" }]);
  });
});
