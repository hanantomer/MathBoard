import { describe, expect, it } from "vitest";
import {
  CONIC_SAMPLE_SPAN,
  HYPERBOLA_BRANCH_EXTENSION,
  conicAsymptotePaths,
  conicBoundingBox,
  conicSvgPaths,
  formatConicDiagramLine,
  hyperbolaFromCenterAndVertex,
  parabolaFromVertexAndPoint,
  parabolaOpensUp,
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
