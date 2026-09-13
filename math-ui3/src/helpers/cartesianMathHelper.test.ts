import { describe, expect, it } from "vitest";
import type {
  LineNotationAttributes,
  NotationAttributes,
} from "common/baseTypes";
import {
  cartesianMathReadout,
  cartesianOrigins,
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

  it("reads (2.0, 3.0) two cells right and three cells up from the origin", () => {
    const px = originX + 2 * cellW;
    const py = originY - 3 * cellH;
    const math = svgPointToMath(
      px,
      py,
      { x: originX, y: originY },
      cellW,
      cellH,
    );
    expect(math).toEqual({ x: 2, y: 3 });
    expect(formatMathPoint(math!.x, math!.y)).toBe("(2.0, 3.0)");
    expect(
      cartesianMathReadout({ x: px, y: py }, axisPair(), cellW, cellH),
    ).toBe("(2.0, 3.0)");
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
    ).toBe("(2.0, 3.0)");
    expect(
      cartesianMathReadout({ x: px, y: py }, axisPair(), cellW, cellH),
    ).toBe("(2.0, 3.0)");
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
});
