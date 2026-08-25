import { describe, expect, it } from "vitest";
import {
  escapeTextForHtml,
  normalizePastedBoardText,
} from "./pastedTextHelper";

describe("normalizePastedBoardText", () => {
  it("keeps a normal geometry problem", () => {
    const problem = [
      "In △ABC, AB = 13 cm, BC = 14 cm and AC = 15 cm.",
      "(D) is a point on (BC) such that (AD) is the altitude to (BC).",
      "1. Calculate the length of (AD).",
      "2. Hence, find the area of △ABC.",
    ].join("\n");
    expect(normalizePastedBoardText(problem)).toBe(problem);
  });

  it("drops an exact doubled payload", () => {
    const once = "In △ABC, AB = 13 cm, BC = 14 cm and AC = 15 cm.";
    expect(normalizePastedBoardText(`${once}\n\n${once}`)).toBe(once);
  });

  it("collapses cumulative prefix lines from a messy copy", () => {
    const messy = [
      "In △ABC, AB = 13 cm",
      "In △ABC, AB = 13 cm, BC = 14 cm and AC = 15 cm.",
      "(D) is a point on (BC)",
      "(D) is a point on (BC) such that (AD) is the altitude to (BC).",
    ].join("\n");
    expect(normalizePastedBoardText(messy)).toBe(
      [
        "In △ABC, AB = 13 cm, BC = 14 cm and AC = 15 cm.",
        "(D) is a point on (BC) such that (AD) is the altitude to (BC).",
      ].join("\n"),
    );
  });

  it("reads HTML when plain text is empty", () => {
    expect(
      normalizePastedBoardText("", "<p>Find AD</p><p>Hence find the area</p>"),
    ).toBe("Find AD\nHence find the area");
  });
});

describe("escapeTextForHtml", () => {
  it("escapes markup so a textarea does not split", () => {
    expect(escapeTextForHtml("a < b & c")).toBe("a &lt; b &amp; c");
  });
});
