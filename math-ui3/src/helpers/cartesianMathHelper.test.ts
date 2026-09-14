import { describe, expect, it } from "vitest";
import type {
  LineNotationAttributes,
  NotationAttributes,
} from "common/baseTypes";
import {
  cartesianAxisTickLabels,
  cartesianMathReadout,
  cartesianOrigins,
  formatAxisTick,
  formatMathPoint,
  snapSvgToHalfCell,
  svgPointToMath,
} from "./cartesianMathHelper";

const cellW = 16.5;
const cellH = 33;
const originX = 10 * cellW;
const originY = 10 * cellH;

function axisPair(): NotationAttributes[] {
  return [
    {
      uuid: "xaxis",
      parentUUId: "p",
      boardType: "LESSON",
      notationType: "LINE",
      user: { uuid: "u" } as LineNotationAttributes["user"],
      p1x: originX - 6 * cellW,
      p1y: originY,
      p2x: originX + 6 * cellW,
      p2y: originY,
      dashed: false,
      arrowLeft: false,
      arrowRight: true,
    },
    {
      uuid: "yaxis",
      parentUUId: "p",
      boardType: "LESSON",
      notationType: "LINE",
      user: { uuid: "u" } as LineNotationAttributes["user"],
      p1x: originX,
      p1y: originY - 3 * cellH,
      p2x: originX,
      p2y: originY + 3 * cellH,
      dashed: false,
      arrowLeft: true,
      arrowRight: false,
    },
  ];
}

describe("cartesianMathHelper", () => {
  it("finds the origin of a ±6-col / ±3-row axis pair", () => {
    const origins = cartesianOrigins(axisPair());
    expect(origins).toEqual([{ x: originX, y: originY }]);
  });

  it("reads (2.0, 6.0) two columns right and three rows up from the origin", () => {
    const px = originX + 2 * cellW;
    const py = originY - 3 * cellH;
    const math = svgPointToMath(
      px,
      py,
      { x: originX, y: originY },
      cellW,
      cellH,
    );
    expect(math).toEqual({ x: 2, y: 6 });
    expect(formatMathPoint(math!.x, math!.y)).toBe("(2.0, 6.0)");
    expect(
      cartesianMathReadout({ x: px, y: py }, axisPair(), cellW, cellH),
    ).toBe("(2.0, 6.0)");
  });

  it("uses a unicode minus for negative y", () => {
    expect(formatMathPoint(2, -3)).toBe("(2.0, \u22123.0)");
  });

  it("snaps to a half-cell so a near miss still reads the lattice point", () => {
    const px = originX + 2 * cellW + 3;
    const py = originY - 3 * cellH + 4;
    const snapped = snapSvgToHalfCell({ x: px, y: py }, cellW, cellH);
    expect(
      cartesianMathReadout(snapped, axisPair(), cellW, cellH),
    ).toBe("(2.0, 6.0)");
    expect(
      cartesianMathReadout({ x: px, y: py }, axisPair(), cellW, cellH),
    ).toBe("(2.0, 6.0)");
  });

  it("returns no label when there are no axes", () => {
    expect(
      cartesianMathReadout(
        { x: originX + cellW, y: originY },
        [],
        cellW,
        cellH,
      ),
    ).toBe("");
    expect(cartesianOrigins([])).toEqual([]);
  });

  it("numbers x and y from −6..6 on the same pixel scale", () => {
    const labels = cartesianAxisTickLabels(
      { x: originX, y: originY },
      cellW,
      cellH,
    );
    const values = labels.map((l) => l.value);
    expect(values).not.toContain("x");
    expect(values).not.toContain("y");
    expect(values).toContain("0");
    expect(values).toContain("6");
    expect(values).toContain(formatAxisTick(-6));
    expect(values.filter((v) => v === "6")).toHaveLength(2);

    const x2 = labels.find(
      (l) => l.value === "2" && Math.abs(l.x - (originX + 2 * cellW)) < cellW,
    );
    expect(x2).toBeTruthy();
    expect(x2!.y).toBeGreaterThan(originY);

    const y2 = labels.find(
      (l) =>
        l.value === "2" && Math.abs(l.y - (originY - cellH)) < cellH / 3,
    );
    expect(y2).toBeTruthy();
    expect(y2!.x).toBeLessThan(originX);
  });
});
