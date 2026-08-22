import { describe, expect, it } from "vitest";
import {
  computeTutorImageLayout,
  invertRgba,
  isMostlyDarkRgba,
  isPracticeImageReadTip,
  TUTOR_MAX_ASPECT,
  TUTOR_MAX_LONG_SIDE,
  TUTOR_TARGET_SHORT_SIDE,
} from "./practiceImagePrep";

function solidRgba(
  pixelCount: number,
  r: number,
  g: number,
  b: number,
): number[] {
  const rgba = new Array(pixelCount * 4);
  for (let p = 0; p < pixelCount; p++) {
    const i = p * 4;
    rgba[i] = r;
    rgba[i + 1] = g;
    rgba[i + 2] = b;
    rgba[i + 3] = 255;
  }
  return rgba;
}

describe("isMostlyDarkRgba", () => {
  it("detects a dark-mode screenshot field", () => {
    expect(isMostlyDarkRgba(solidRgba(4000, 8, 8, 8))).toBe(true);
  });

  it("leaves a printed worksheet as light", () => {
    expect(isMostlyDarkRgba(solidRgba(4000, 245, 245, 245))).toBe(false);
  });
});

describe("invertRgba", () => {
  it("flips RGB and keeps alpha", () => {
    const rgba = [10, 20, 30, 255, 200, 210, 220, 128];
    invertRgba(rgba);
    expect(rgba).toEqual([245, 235, 225, 255, 55, 45, 35, 128]);
  });
});

describe("computeTutorImageLayout", () => {
  it("upscales and pads a thin 455x112 strip past Gemini's tiling cliff", () => {
    const layout = computeTutorImageLayout(455, 112);
    expect(Math.min(layout.drawW, layout.drawH)).toBeGreaterThanOrEqual(300);
    expect(Math.max(layout.canvasW, layout.canvasH)).toBeLessThanOrEqual(
      TUTOR_MAX_LONG_SIDE + 48,
    );
    expect(layout.canvasW / layout.canvasH).toBeLessThanOrEqual(
      TUTOR_MAX_ASPECT + 0.05,
    );
    expect(layout.canvasH / layout.canvasW).toBeLessThanOrEqual(
      TUTOR_MAX_ASPECT + 0.05,
    );
    expect(layout.drawW).toBeGreaterThan(layout.drawH);
    expect(layout.offsetY).toBeGreaterThan(0);
  });

  it("does not inflate an already large page beyond the long-side cap", () => {
    const layout = computeTutorImageLayout(1200, 1600);
    expect(Math.max(layout.drawW, layout.drawH)).toBeLessThanOrEqual(
      TUTOR_MAX_LONG_SIDE,
    );
    expect(Math.min(layout.drawW, layout.drawH)).toBeGreaterThan(
      TUTOR_TARGET_SHORT_SIDE / 2,
    );
  });
});

describe("isPracticeImageReadTip", () => {
  it("matches unreadable and misread copy", () => {
    expect(
      isPracticeImageReadTip("I couldn't read that image clearly. Paste the question as text."),
    ).toBe(true);
    expect(
      isPracticeImageReadTip(
        "I may have misread the worksheet. Paste the question as text.",
      ),
    ).toBe(true);
    expect(isPracticeImageReadTip("Find the altitude to BC first.")).toBe(
      false,
    );
  });
});
