import { describe, expect, it } from "vitest";
import {
  CONIC_SAMPLE_SPAN,
  HYPERBOLA_BRANCH_EXTENSION,
  conicAsymptotePaths,
  conicBoundingBox,
  conicMoveBy,
  conicOpeningHandlePoint,
  conicScaleHandlePoint,
  conicSvgPaths,
  defaultHyperbolaAt,
  defaultParabolaAt,
  distanceToConic,
  formatConicDiagramLine,
  hyperbolaFromCenterAndVertex,
  hyperbolaScaleAFromPoint,
  parabolaFromVertexAndPoint,
  parabolaOpenFromPoint,
  parabolaOpensUp,
  parabolaScaleSizeFromPoint,
} from "common/conicGeometry";

describe("parabolaFromVertexAndPoint", () => {
  it("solves a vertical parabola through a point and opens toward the top", () => {
    const conic = parabolaFromVertexAndPoint(100, 100, 110, 60);
    expect(conic.kind).toBe("parabola");
    expect(conic.axis).toBe("vertical");
    expect(conic.a).toBeCloseTo((60 - 100) / (10 * 10));
    expect(parabolaOpensUp(conic)).toBe(true);
    expect(conicSvgPaths(conic)).toHaveLength(1);
    expect(conicSvgPaths(conic)[0]).toMatch(/^M /);
    const box = conicBoundingBox(conic);
    expect(box.maxY - box.minY).toBeLessThan(500);
  });

  it("stays compact by default and grows when the scale point is farther", () => {
    const compact = parabolaFromVertexAndPoint(100, 100, 120, 60);
    const stretched = parabolaFromVertexAndPoint(100, 100, 120, -20);
    const compactH = conicBoundingBox(compact).maxY - conicBoundingBox(compact).minY;
    const stretchedH =
      conicBoundingBox(stretched).maxY - conicBoundingBox(stretched).minY;
    expect(compactH).toBeLessThanOrEqual(CONIC_SAMPLE_SPAN + 1);
    expect(stretchedH).toBeGreaterThan(compactH);
  });
});

describe("default parabola and hyperbola", () => {
  it("starts as a compact upward-opening parabola, not a flat line", () => {
    const conic = defaultParabolaAt(100, 100);
    expect(conic.kind).toBe("parabola");
    expect(conic.axis).toBe("vertical");
    expect(parabolaOpensUp(conic)).toBe(true);
    expect(Math.abs(conic.a)).toBeGreaterThan(0.01);
    const box = conicBoundingBox(conic);
    expect(box.maxY - box.minY).toBeLessThanOrEqual(CONIC_SAMPLE_SPAN + 1);
    expect(box.maxY - box.minY).toBeGreaterThan(20);
  });

  it("starts as a compact horizontal hyperbola", () => {
    const conic = defaultHyperbolaAt(100, 100);
    expect(conic.kind).toBe("hyperbola");
    expect(conic.axis).toBe("horizontal");
    expect(Math.abs(conic.a)).toBeGreaterThan(8);
    expect(conic.b).toBe(Math.abs(conic.a));
  });
});

describe("conic move and scale", () => {
  it("translates the vertex without changing a", () => {
    const conic = parabolaFromVertexAndPoint(100, 100, 120, 60);
    const moved = conicMoveBy(conic, 10, -5);
    expect(moved.hx).toBe(conic.hx + 10);
    expect(moved.hy).toBe(conic.hy - 5);
    expect(moved.a).toBe(conic.a);
    expect(moved.axis).toBe(conic.axis);
  });

  it("size handle changes width without changing arm height", () => {
    const conic = defaultParabolaAt(100, 100);
    const oldRise = (conic.a ?? 0) * (conic.b ?? 1) * (conic.b ?? 1);
    const sized = parabolaScaleSizeFromPoint(conic, 180, 40);
    expect(sized.b).toBe(80);
    expect(sized.axis).toBe("vertical");
    expect(sized.a * (sized.b ?? 1) * (sized.b ?? 1)).toBeCloseTo(oldRise);
  });

  it("open handle changes curvature without changing width", () => {
    const conic = defaultParabolaAt(100, 100);
    const opened = parabolaOpenFromPoint(conic, 100, 20);
    expect(opened.b).toBe(conic.b);
    expect(opened.axis).toBe("vertical");
    expect(opened.a).not.toBeCloseTo(conic.a);
  });

  it("keeps a vertical parabola vertical while stretching", () => {
    const conic = parabolaFromVertexAndPoint(100, 100, 120, 60);
    expect(conic.axis).toBe("vertical");
    const stretched = parabolaScaleSizeFromPoint(conic, 180, 40);
    expect(stretched.axis).toBe("vertical");
    expect(stretched.hx).toBe(100);
    expect(stretched.hy).toBe(100);
    expect(stretched.b).toBe(80);
  });

  it("preserves hyperbola opening b when the vertex is dragged", () => {
    const conic = hyperbolaFromCenterAndVertex(100, 100, 140, 100);
    conic.b = 30;
    const stretched = hyperbolaScaleAFromPoint(conic, 160, 130);
    expect(stretched.a).toBe(60);
    expect(stretched.b).toBe(30);
    expect(stretched.axis).toBe("horizontal");
  });

  it("places the opening handle on a hyperbola branch", () => {
    const conic = hyperbolaFromCenterAndVertex(100, 100, 140, 100);
    const handle = conicOpeningHandlePoint(conic);
    expect(distanceToConic(conic, handle)).toBeLessThan(2);
  });

  it("places the size handle on the vertex line, not on the curve", () => {
    const conic = parabolaFromVertexAndPoint(100, 100, 120, 60);
    const handle = conicScaleHandlePoint(conic);
    expect(handle.y).toBe(conic.hy);
    expect(handle.x).toBe(conic.hx + (conic.b ?? 0));
  });

  it("places the open handle on a parabola's axis of symmetry", () => {
    const conic = defaultParabolaAt(100, 100);
    const handle = conicOpeningHandlePoint(conic);
    expect(handle.x).toBe(conic.hx);
    expect(handle.y).not.toBe(conic.hy);
  });

  it("does not flip axis when sizing or opening", () => {
    const conic = parabolaFromVertexAndPoint(100, 100, 120, 60);
    expect(parabolaScaleSizeFromPoint(conic, 180, 105).axis).toBe("vertical");
    expect(parabolaOpenFromPoint(conic, 180, 105).axis).toBe("vertical");
  });
});

describe("hyperbolaFromCenterAndVertex", () => {
  it("builds two branches and dashed asymptotes", () => {
    const conic = hyperbolaFromCenterAndVertex(100, 100, 140, 100);
    expect(conic.kind).toBe("hyperbola");
    expect(conic.axis).toBe("horizontal");
    expect(conic.a).toBe(40);
    expect(conicSvgPaths(conic)).toHaveLength(2);
    expect(conicAsymptotePaths(conic)).toHaveLength(2);
    const box = conicBoundingBox(conic);
    expect(box.maxX - box.minX).toBeLessThanOrEqual(
      2 * (40 + HYPERBOLA_BRANCH_EXTENSION) + 1,
    );
  });

  it("grows when the vertex is farther from the center", () => {
    const compact = hyperbolaFromCenterAndVertex(100, 100, 120, 100);
    const stretched = hyperbolaFromCenterAndVertex(100, 100, 160, 100);
    const compactW = conicBoundingBox(compact).maxX - conicBoundingBox(compact).minX;
    const stretchedW =
      conicBoundingBox(stretched).maxX - conicBoundingBox(stretched).minX;
    expect(compactW).toBeLessThan(stretchedW);
  });
});

describe("formatConicDiagramLine", () => {
  it("converts a pixel vertex to axis units with y flipped", () => {
    const conic = parabolaFromVertexAndPoint(133, 299, 133, 259);
    const line = formatConicDiagramLine(
      conic,
      { x: 100, y: 200 },
      16.5,
      33,
    );
    expect(line).toMatch(/^diagram: parabola vertex≈\(2\.0,-3\.0\) opens=up$/);
  });
});
