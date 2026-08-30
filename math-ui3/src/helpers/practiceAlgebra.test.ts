import { describe, expect, it } from "vitest";
import {
  parseQuadraticExpr,
  parseVertexQuadratic,
  reviewVertexRewrite,
  workHasEquivalentVertexForm,
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
    expect(workHasEquivalentVertexForm(problem, work)).toBe(true);
  });

  it("strips tutor markup before parsing", () => {
    const work = [
      "f(x)=2x^2-8x+5",
      "<<active>> [Part 1] f(x)=2(x-2)^2-3",
    ].join("\n");
    expect(workHasEquivalentVertexForm(problem, work)).toBe(true);
  });
});
