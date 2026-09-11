import { describe, expect, it } from "vitest";
import { applyTextResizeHandle } from "./textResizeHelper";

const start = { left: 100, top: 80, width: 120, height: 60 };

describe("applyTextResizeHandle", () => {
  it("grows from the southeast corner", () => {
    expect(
      applyTextResizeHandle(start, "se", 250, 180, 220, 140, 40, 30),
    ).toEqual({ left: 100, top: 80, width: 150, height: 100 });
  });

  it("shrinks from the northwest corner without going below min size", () => {
    expect(
      applyTextResizeHandle(start, "nw", 200, 130, 100, 80, 40, 30),
    ).toEqual({ left: 180, top: 110, width: 40, height: 30 });
  });

  it("resizes east only", () => {
    expect(
      applyTextResizeHandle(start, "e", 250, 110, 220, 110, 40, 30),
    ).toEqual({ left: 100, top: 80, width: 150, height: 60 });
  });
});
