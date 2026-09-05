import { describe, expect, it } from "vitest";
import {
  parseQuadraticExpr,
  parseVertexQuadratic,
  reviewVertexRewrite,
  activePartLooksComplete,
  workHasEquivalentVertexForm,
  workHasVertexCoordinates,
  workHasParabolaGraph,
  workHasYIntercept,
  workHasYInterceptValueOnly,
  yInterceptCoachOverride,
  Y_INTERCEPT_AS_POINT_TIP,
} from "common/practiceAlgebra";

const ORIGINAL = { a: 2, b: -8, c: 5 };

describe("parseVertexQuadratic", () => {
  it("expands 2(x-2)^2-3 to 2x^2-8x+5", () => {
    expect(parseVertexQuadratic("2(x-2)^2-3")).toEqual(ORIGINAL);
  });
});

describe("parseQuadraticExpr", () => {
  it("expands completing the square with compensation outside", () => {
    expect(parseQuadraticExpr("2(x^2-4x+4)-8+5")).toEqual(ORIGINAL);
  });

  it("expands adding and subtracting the square inside", () => {
    expect(parseQuadraticExpr("2(x^2-4x+4-4)+5")).toEqual(ORIGINAL);
  });

  it("expands 2(x-2)^2-8+5", () => {
    expect(parseQuadraticExpr("2(x-2)^2-8+5")).toEqual(ORIGINAL);
  });

  it("rejects mixing inside 4 with inside 8", () => {
    expect(parseQuadraticExpr("2(x^2-4x+4-8)+5")).toEqual({
      a: 2,
      b: -8,
      c: -3,
    });
  });
});

describe("workHasEquivalentVertexForm", () => {
  const problem = [
    "A quadratic function is given by f(x) = 2x^2 - 8x + 5",
    "Write the function in vertex form.",
    "State the coordinates of the vertex.",
  ].join("\n");

  it("accepts a correct last line after messy completing-the-square steps", () => {
    const work = [
      "f(x)=2x^2-8x+5",
      "f(x)=2(x^2-4x+4-4)-5",
      "f(x)=2(x-4)^2-8+5",
      "f(x)=2(x-2)^2-3",
    ].join("\n");
    expect(workHasEquivalentVertexForm(problem, work)).toBe(true);
    const review = reviewVertexRewrite(problem, work);
    expect(review.simplified).toBe(true);
    expect(review.equivalent).toBe(true);
    expect(review.warning).toMatch(/2\(x²-4x\+4-4\)-5/);
    expect(review.warning).toMatch(/\(x-4\)/);
    expect(review.warning).toMatch(/\(x-2\)/);
  });

  it("has no warning when every rewrite line is equivalent", () => {
    const work = ["f(x)=2x^2-8x+5", "f(x)=2(x-2)^2-3"].join("\n");
    expect(reviewVertexRewrite(problem, work).warning).toBeNull();
  });

  it("accepts unicode superscripts from the board", () => {
    const work = "f(x)=2(x-2)²-3";
    expect(workHasEquivalentVertexForm(problem, work)).toBe(true);
  });

  it("rejects copying the original without a vertex form", () => {
    expect(
      workHasEquivalentVertexForm(problem, "f(x)=2x^2-8x+5"),
    ).toBe(false);
  });

  it("rejects a last vertex form that does not match", () => {
    const work = [
      "f(x)=2x^2-8x+5",
      "f(x)=2(x-4)^2-3",
    ].join("\n");
    expect(workHasEquivalentVertexForm(problem, work)).toBe(false);
  });

  it("treats a correct completing-the-square line as matching, not done", () => {
    const work = [
      "f(x)=2x^2-8x+5",
      "f(x)=2(x^2-4x+4)-8+5",
    ].join("\n");
    const review = reviewVertexRewrite(problem, work);
    expect(review.equivalent).toBe(false);
    expect(review.rewriteMatches).toBe(true);
    expect(workHasEquivalentVertexForm(problem, work)).toBe(false);
  });

  it("treats adding and subtracting 4 inside as matching", () => {
    const work = [
      "f(x)=2x^2-8x+5",
      "f(x)=2(x^2-4x+4-4)+5",
    ].join("\n");
    const review = reviewVertexRewrite(problem, work);
    expect(review.equivalent).toBe(false);
    expect(review.rewriteMatches).toBe(true);
  });

  it("treats adding and subtracting 8 inside as matching (cancels)", () => {
    const work = [
      "f(x)=2x^2-8x+5",
      "f(x)=2(x^2-4x+8-8)+5",
    ].join("\n");
    const review = reviewVertexRewrite(problem, work);
    expect(review.equivalent).toBe(false);
    expect(review.rewriteMatches).toBe(true);
  });

  it("does not treat +4-8 inside the parentheses as matching", () => {
    const work = [
      "f(x)=2x^2-8x+5",
      "f(x)=2(x^2-4x+4-8)+5",
    ].join("\n");
    const review = reviewVertexRewrite(problem, work);
    expect(review.equivalent).toBe(false);
    expect(review.rewriteMatches).toBe(false);
  });

  it("accepts unsimplified vertex form 2(x-2)^2-8+5", () => {
    const work = [
      "f(x)=2x^2-8x+5",
      "f(x)=2(x-2)^2-8+5",
    ].join("\n");
    const review = reviewVertexRewrite(problem, work);
    expect(review.equivalent).toBe(true);
    expect(review.simplified).toBe(false);
    expect(workHasEquivalentVertexForm(problem, work)).toBe(true);
    expect(activePartLooksComplete(problem, work)).toBe(false);
  });

  it("accepts board vertex form after a cancelled +4−4 completing-the-square line", () => {
    const work = [
      "[Part 1]",
      "2(x^2-4x)+5",
      "2(x-2+4-4)^2+5",
      "<<active>> 2(x-2)^2-3",
      "[Part 2]",
      "(none yet for part 2)",
    ].join("\n");
    expect(workHasEquivalentVertexForm(problem, work)).toBe(true);
  });

  it("treats only the active part as complete", () => {
    const work = [
      "[Part 1]",
      "2(x-2)^2-3",
      "[Part 2]",
      "(none yet for part 2)",
    ].join("\n");
    expect(activePartLooksComplete(problem, work, "1")).toBe(true);
    expect(activePartLooksComplete(problem, work, "2")).toBe(false);
  });

  it("completes the coordinates part from h and k or an ordered pair", () => {
    const work = [
      "[Part 1]",
      "2(x-2)^2-3",
      "[Part 2]",
      "<<active>> h=2 k=-3",
    ].join("\n");
    expect(activePartLooksComplete(problem, work, "2")).toBe(true);
    expect(workHasVertexCoordinates(problem, "h=2 k=-3")).toBe(true);
    expect(workHasVertexCoordinates(problem, "(2,-3)")).toBe(true);
    expect(workHasVertexCoordinates(problem, "2(x-2)^2-3")).toBe(false);
    expect(
      activePartLooksComplete(
        problem,
        "[Part 2]\n2(x-2)^2-3",
        "2",
      ),
    ).toBe(false);
  });

  it("does not treat a factored rewrite as complete", () => {
    const work = ["[Part 1]", "2(x^2-4x)+5"].join("\n");
    expect(activePartLooksComplete(problem, work, "1")).toBe(false);
  });

  it("does not ignore later vertex form after a factored first line", () => {
    const work = [
      "[Part 1]",
      "f(x)=2(x^2-4x)+5",
      "f(x)=2(x-2+4-4)^2+5",
      "<<active>> f(x)=2(x-2)^2-3",
    ].join("\n");
    expect(activePartLooksComplete(problem, work, "1")).toBe(true);
  });

  it("treats unlabeled continuation rows as part 1 work", () => {
    const work = [
      "[Part 1]",
      "<<active>> (none yet for part 1)",
      "unlabeled:",
      "f(x)=2(x^2-4x)+5",
      "f(x)=2(x-2+4-4)^2+5",
      "f(x)=2(x-2)^2-3",
    ].join("\n");
    expect(activePartLooksComplete(problem, work, "1")).toBe(true);
  });

  it("strips tutor markup before parsing", () => {
    const work = [
      "f(x)=2x^2-8x+5",
      "<<active>> [Part 1] f(x)=2(x-2)^2-3",
    ].join("\n");
    expect(workHasEquivalentVertexForm(problem, work)).toBe(true);
  });
});

describe("workHasParabolaGraph", () => {
  const problem = [
    "A quadratic function is given by f(x) = 2x^2 - 8x + 5",
    "1. Write the function in vertex form.",
    "2. State the coordinates of the vertex.",
    "3. Find the axis of symmetry.",
    "4. Find the y-intercept.",
    "5. Sketch a rough graph of the parabola.",
    "6. State whether the function has a maximum or a minimum.",
  ].join("\n");

  it("accepts a sketch with opening up and vertex near (2,-3)", () => {
    const diagram = "diagram: parabola vertex≈(2.0,-3.0) opens=up";
    expect(workHasParabolaGraph(problem, diagram)).toBe(true);
    const work = ["[Part 5]", "<<active>>", diagram].join("\n");
    expect(activePartLooksComplete(problem, work, "5")).toBe(true);
  });

  it("accepts opening-only when the sign of a matches", () => {
    expect(workHasParabolaGraph(problem, "diagram: parabola opens=up")).toBe(
      true,
    );
  });

  it("rejects the wrong opening or a far vertex", () => {
    expect(
      workHasParabolaGraph(problem, "diagram: parabola opens=down"),
    ).toBe(false);
    expect(
      workHasParabolaGraph(
        problem,
        "diagram: parabola vertex≈(0.0,0.0) opens=up",
      ),
    ).toBe(false);
  });
});

describe("workHasYIntercept", () => {
  const problem = [
    "A quadratic function is given by f(x) = 2x^2 - 8x + 5",
    "1. Write the function in vertex form.",
    "2. State the coordinates of the vertex.",
    "3. Find the axis of symmetry.",
    "4. Find the y-intercept.",
  ].join("\n");

  const partWork = (body: string) =>
    ["[Part 4]", "<<active>> " + body].join("\n");

  it("does not treat a lone y=5 as the intercept", () => {
    expect(workHasYIntercept(problem, "y=5")).toBe(false);
    expect(workHasYInterceptValueOnly(problem, "y=5")).toBe(true);
    expect(yInterceptCoachOverride(problem, "y=5")).toEqual({
      speak: true,
      tip: Y_INTERCEPT_AS_POINT_TIP,
    });
    expect(activePartLooksComplete(problem, partWork("y=5"), "4")).toBe(
      false,
    );
  });

  it("nudges after evaluating f(0) to y=5 without the point", () => {
    const work = "y=2(0^2-4*0)+5 y=5";
    expect(workHasYIntercept(problem, work)).toBe(false);
    expect(workHasYInterceptValueOnly(problem, work)).toBe(true);
    expect(yInterceptCoachOverride(problem, work)?.speak).toBe(true);
  });

  it("accepts the point, f(0)=, or x=0 with y=5", () => {
    expect(workHasYIntercept(problem, "(0,5)")).toBe(true);
    expect(workHasYIntercept(problem, "[0,5]")).toBe(true);
    expect(workHasYIntercept(problem, "f(0)=5")).toBe(true);
    expect(workHasYIntercept(problem, "x=0 y=5")).toBe(true);
    expect(workHasYInterceptValueOnly(problem, "(0,5)")).toBe(false);
    expect(yInterceptCoachOverride(problem, "(0,5)")).toEqual({
      speak: false,
      tip: "",
    });
    expect(activePartLooksComplete(problem, partWork("(0,5)"), "4")).toBe(
      true,
    );
  });

  it("does not treat y=2(...) as a finished y-value", () => {
    const work = "y=2(0^2-4*0)+5";
    expect(workHasYIntercept(problem, work)).toBe(false);
    expect(workHasYInterceptValueOnly(problem, work)).toBe(false);
    expect(yInterceptCoachOverride(problem, work)).toBeNull();
  });
});
