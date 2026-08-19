import { describe, expect, it } from "vitest";
import type {
  AnnotationNotationAttributes,
  LineNotationAttributes,
  PointNotationAttributes,
} from "common/baseTypes";
import { serializePracticeDiagram, serializePracticeFractions } from "./practiceDiagramSerializeHelper";

const cell = { cellW: 16.5, cellH: 33 };

function line(
  uuid: string,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
): LineNotationAttributes {
  return {
    uuid,
    parentUUId: "p",
    boardType: "PRACTICE",
    notationType: "LINE",
    user: { uuid: "u" } as LineNotationAttributes["user"],
    p1x,
    p1y,
    p2x,
    p2y,
    dashed: false,
    arrowLeft: false,
    arrowRight: false,
  };
}

function sym(
  uuid: string,
  col: number,
  row: number,
  value: string,
): PointNotationAttributes {
  return {
    uuid,
    parentUUId: "p",
    boardType: "PRACTICE",
    notationType: "SYMBOL",
    user: { uuid: "u" } as PointNotationAttributes["user"],
    col,
    row,
    value,
    followsFraction: false,
  };
}

function ann(
  uuid: string,
  x: number,
  y: number,
  value: string,
): AnnotationNotationAttributes {
  return {
    uuid,
    parentUUId: "p",
    boardType: "PRACTICE",
    notationType: "ANNOTATION",
    user: { uuid: "u" } as AnnotationNotationAttributes["user"],
    x,
    y,
    value,
    rotation: 0,
  };
}

describe("serializePracticeDiagram", () => {
  it("describes a labeled right triangle instead of [diagram]", () => {
    // C(0,200) right angle; B(240,200); A(0,20)
    const notations = [
      line("ab", 0, 20, 240, 200),
      line("bc", 240, 200, 0, 200),
      line("ca", 0, 200, 0, 20),
      ann("la", 8, 110, "a"),
      ann("lb", 120, 214, "b"),
      ann("lc", 140, 90, "c"),
      ann("a90", 18, 188, "90°"),
      sym("vA", -1, 0, "A"),
      sym("vB", 15, 6, "B"),
      sym("vC", -1, 6, "C"),
    ];

    const { lines, consumedUuids } = serializePracticeDiagram(notations, cell);
    const text = lines.join("\n");

    expect(text).not.toContain("[diagram]");
    expect(text).toMatch(/closed right triangle/);
    expect(text).toMatch(/sides:/);
    expect(text).toMatch(/\ba\b/);
    expect(text).toMatch(/\bb\b/);
    expect(text).toMatch(/\bc\b/);
    expect(text).toMatch(/labeled 90°/);
    expect(text).toMatch(/inferred right angle/);
    expect(consumedUuids.has("la")).toBe(true);
    expect(consumedUuids.has("a90")).toBe(true);
  });

  it("tokenizes the meeting angle of two segments", () => {
    const notations = [
      line("s1", 0, 100, 120, 100),
      line("s2", 0, 100, 0, 0),
      ann("th", 22, 82, "θ"),
    ];
    const text = serializePracticeDiagram(notations, cell).lines.join("\n");
    expect(text).toMatch(/2 segments meeting at a vertex/);
    expect(text).toMatch(/labeled θ/);
    expect(text).toMatch(/inferred right angle/);
  });

  it("lists labels near a freehand sketch", () => {
    const notations = [
      {
        uuid: "sk",
        parentUUId: "p",
        boardType: "PRACTICE" as const,
        notationType: "FREESKETCH" as const,
        user: { uuid: "u" } as LineNotationAttributes["user"],
        points: [
          { x: 0, y: 0 },
          { x: 80, y: 0 },
          { x: 0, y: 80 },
          { x: 0, y: 0 },
        ],
      },
      ann("la", 40, 8, "a"),
      ann("th", 10, 10, "θ"),
    ];
    const text = serializePracticeDiagram(notations, cell).lines.join("\n");
    expect(text).toContain("[freehand sketch]");
    expect(text).toMatch(/labels near sketch:.*a/);
    expect(text).toMatch(/angle labels:.*θ/);
  });

  it("leaves algebra rows out of diagram labels", () => {
    const notations = [
      line("s1", 0, 200, 200, 200),
      line("s2", 200, 200, 200, 40),
      line("s3", 200, 40, 0, 200),
      sym("eq1", 40, 2, "a"),
      sym("eq2", 41, 2, "+"),
      sym("eq3", 42, 2, "b"),
      sym("eq4", 43, 2, "="),
      sym("eq5", 44, 2, "6"),
      sym("eq6", 45, 2, "0"),
    ];
    const { consumedUuids, lines } = serializePracticeDiagram(notations, cell);
    expect(consumedUuids.has("eq1")).toBe(false);
    expect(lines.join("\n")).toMatch(/closed (right )?triangle/);
  });
});

function divisionLine(
  uuid: string,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
): LineNotationAttributes {
  return { ...line(uuid, p1x, p1y, p2x, p2y), notationType: "DIVISIONLINE" };
}

describe("serializePracticeFractions", () => {
  it("reads a stacked fraction as (num)/(den)", () => {
    const y = 5 * cell.cellH;
    const notations = [
      sym("a", 5, 4, "a"),
      divisionLine("d", 3 * cell.cellW, y, 8 * cell.cellW, y),
      sym("b", 5, 5, "b"),
    ];
    const { inserts, consumedUuids } = serializePracticeFractions(
      notations,
      cell,
    );
    expect(inserts.map((i) => i.text)).toEqual(["(a)/(b)"]);
    expect(consumedUuids.has("a")).toBe(true);
    expect(consumedUuids.has("b")).toBe(true);
  });

  it("keeps neighboring algebra on the baseline", () => {
    const y = 5 * cell.cellH;
    const notations = [
      sym("one", 1, 5, "1"),
      sym("plus", 2, 5, "+"),
      sym("a", 5, 4, "a"),
      divisionLine("d", 4 * cell.cellW, y, 7 * cell.cellW, y),
      sym("b", 5, 5, "b"),
      sym("eq", 9, 5, "="),
      sym("n1", 10, 5, "1"),
      sym("n5", 11, 5, "5"),
      sym("n0", 12, 5, "0"),
    ];
    const { inserts, consumedUuids } = serializePracticeFractions(
      notations,
      cell,
    );
    expect(inserts[0]?.text).toBe("(a)/(b)");
    expect(consumedUuids.has("one")).toBe(false);
    expect(consumedUuids.has("eq")).toBe(false);
  });
});
