import { describe, expect, it } from "vitest";
import {
  PRACTICE_COACH_BALLOON_GAP,
  placePracticeCoachBalloon,
} from "./practiceCoachAnchorHelper";

const BOUNDS = {
  minLeft: 80,
  minTop: 80,
  maxRight: 1200,
  maxBottom: 800,
};

describe("placePracticeCoachBalloon", () => {
  it("sits well below the writing when there is room", () => {
    const pos = placePracticeCoachBalloon(
      { left: 120, top: 100, right: 160, bottom: 140 },
      260,
      140,
      BOUNDS,
    );
    expect(pos.top).toBe(140 + PRACTICE_COACH_BALLOON_GAP);
    expect(pos.left).toBe(120);
  });

  it("moves to the right instead of covering the writing when below does not fit", () => {
    const pos = placePracticeCoachBalloon(
      { left: 200, top: 620, right: 240, bottom: 660 },
      260,
      140,
      BOUNDS,
    );
    expect(pos.left).toBeGreaterThanOrEqual(240 + PRACTICE_COACH_BALLOON_GAP);
    expect(pos.top + 140).toBeLessThanOrEqual(BOUNDS.maxBottom);
    expect(pos.top).toBeLessThan(660);
  });

  it("stays below work at the left edge instead of covering it", () => {
    const pos = placePracticeCoachBalloon(
      { left: 80, top: 120, right: 200, bottom: 160 },
      260,
      140,
      BOUNDS,
    );
    expect(pos.top).toBeGreaterThanOrEqual(160 + PRACTICE_COACH_BALLOON_GAP);
    expect(pos.left).toBeGreaterThanOrEqual(80);
  });
});
