import { describe, expect, it } from "vitest";
import {
  canActivatePart,
  extendPushBlockForPracticeParts,
  lockedPartHint,
  orderPartLabelRowsByList,
  partIdForRow,
  partStatus,
  shiftedPartLabelRows,
  startedPartIdsFromSession,
  withSeededFirstPartRow,
} from "./practicePartOrderHelper";

const parts = [
  { id: "1", text: "First" },
  { id: "2", text: "Second" },
  { id: "3", text: "Third" },
];

describe("canActivatePart", () => {
  it("allows the first part when nothing is started", () => {
    expect(canActivatePart(parts, [], "1")).toBe(true);
    expect(canActivatePart(parts, [], "2")).toBe(false);
    expect(canActivatePart(parts, [], "3")).toBe(false);
  });

  it("allows any started part and only the next unstarted one", () => {
    expect(canActivatePart(parts, ["1"], "1")).toBe(true);
    expect(canActivatePart(parts, ["1"], "2")).toBe(true);
    expect(canActivatePart(parts, ["1"], "3")).toBe(false);
    expect(canActivatePart(parts, ["1", "2"], "1")).toBe(true);
    expect(canActivatePart(parts, ["1", "2"], "3")).toBe(true);
  });

  it("rejects unknown ids", () => {
    expect(canActivatePart(parts, ["1"], "9")).toBe(false);
  });
});

describe("startedPartIdsFromSession", () => {
  it("seeds the first part after submit", () => {
    expect(
      startedPartIdsFromSession({
        submitted: true,
        parts,
        completedPartIds: [],
        activePartId: "1",
      }),
    ).toEqual(["1"]);
  });

  it("derives started parts from labels, completed, and active when the field is missing", () => {
    expect(
      startedPartIdsFromSession({
        submitted: true,
        parts,
        completedPartIds: ["1"],
        activePartId: "2",
        partLabelRows: { "1": 0, "2": 4 },
      }).sort(),
    ).toEqual(["1", "2"]);
  });
});

describe("withSeededFirstPartRow", () => {
  it("pins the first part at row 0 without moving later marks", () => {
    expect(withSeededFirstPartRow(parts)).toEqual({ "1": 0 });
    expect(withSeededFirstPartRow(parts, { "1": 0, "2": 4 })).toEqual({
      "1": 0,
      "2": 4,
    });
    expect(withSeededFirstPartRow(parts, { "2": 0 })).toEqual({
      "1": 0,
      "2": 1,
    });
  });
});

describe("orderPartLabelRowsByList", () => {
  it("puts (1) above (2) when rows were swapped", () => {
    expect(orderPartLabelRowsByList(parts, { "1": 1, "2": 0 })).toEqual({
      "1": 0,
      "2": 1,
    });
  });
});

describe("partIdForRow", () => {
  it("assigns rows from a start mark until the next start", () => {
    const rows = { "1": 0, "2": 5, "3": 10 };
    expect(partIdForRow(0, rows)).toBe("1");
    expect(partIdForRow(4, rows)).toBe("1");
    expect(partIdForRow(5, rows)).toBe("2");
    expect(partIdForRow(9, rows)).toBe("2");
    expect(partIdForRow(12, rows)).toBe("3");
  });

  it("returns null above the first mark", () => {
    expect(partIdForRow(0, { "1": 2 })).toBeNull();
  });
});

describe("lockedPartHint", () => {
  it("names the next required section", () => {
    expect(lockedPartHint(parts, ["1"], "3")).toBe("Start (2) before (3).");
    expect(lockedPartHint(parts, ["1"], "2")).toBeNull();
  });
});

describe("partStatus", () => {
  it("prefers completed over started", () => {
    expect(partStatus("1", ["1"], ["1"])).toBe("completed");
    expect(partStatus("2", ["1", "2"], ["1"])).toBe("started");
    expect(partStatus("3", ["1", "2"], ["1"])).toBe("locked");
  });
});

describe("extendPushBlockForPracticeParts", () => {
  it("extends lastRow through later section starts", () => {
    expect(
      extendPushBlockForPracticeParts(
        { firstRow: 1, lastRow: 2 },
        1,
        { "1": 0, "2": 8, "3": 12 },
      ),
    ).toEqual({ firstRow: 1, lastRow: 12 });
  });

  it("uses later labels when the math block is empty", () => {
    expect(
      extendPushBlockForPracticeParts(
        { firstRow: -1, lastRow: -1 },
        3,
        { "1": 0, "2": 8 },
      ),
    ).toEqual({ firstRow: 8, lastRow: 8 });
  });

  it("does not treat the mark on the caret row as a later section", () => {
    expect(
      extendPushBlockForPracticeParts(
        { firstRow: -1, lastRow: -1 },
        0,
        { "1": 0, "2": 8 },
      ),
    ).toEqual({ firstRow: 8, lastRow: 8 });
  });
});

describe("shiftedPartLabelRows", () => {
  it("pushes later section starts and leaves the current mark", () => {
    expect(shiftedPartLabelRows({ "1": 0, "2": 8, "3": 12 }, 0, 0)).toEqual({
      "1": 0,
      "2": 9,
      "3": 13,
    });
    expect(shiftedPartLabelRows({ "1": 0, "2": 8, "3": 12 }, 1, 3)).toEqual({
      "1": 0,
      "2": 9,
      "3": 13,
    });
  });
});
