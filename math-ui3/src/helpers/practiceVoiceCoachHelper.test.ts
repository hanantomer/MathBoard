import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  resetPracticeVoiceCoach,
  schedulePracticeVoiceCoach,
} from "./practiceVoiceCoachHelper";

describe("schedulePracticeVoiceCoach", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetPracticeVoiceCoach();
  });

  afterEach(() => {
    resetPracticeVoiceCoach();
    vi.useRealTimers();
  });

  function boardCoach(work: { current: string }) {
    const requestCoach = vi.fn(async (_q: string, studentWork: string) => ({
      speak: true,
      tip: studentWork.includes("8")
        ? "The coefficient inside should be 4, not 8."
        : "Now, complete the square inside the parentheses.",
    }));
    const onTip = vi.fn();
    const deps = {
      questionUUId: "q",
      mode: "text" as const,
      source: "board" as const,
      getStudentWork: () => work.current,
      requestCoach,
      onTip,
    };
    return { requestCoach, onTip, deps };
  }

  it("re-coaches a correction without waiting 22s", async () => {
    const work = { current: "2(x^2-8x)+5" };
    const { requestCoach, onTip, deps } = boardCoach(work);

    schedulePracticeVoiceCoach(deps);
    await vi.advanceTimersByTimeAsync(4500);
    expect(onTip).toHaveBeenCalledWith(
      "The coefficient inside should be 4, not 8.",
    );

    work.current = "2(x^2-4x)+5";
    schedulePracticeVoiceCoach(deps);
    await vi.advanceTimersByTimeAsync(4500);
    expect(onTip).toHaveBeenCalledWith(
      "Now, complete the square inside the parentheses.",
    );
    expect(requestCoach).toHaveBeenCalledTimes(2);
  });

  it("retries after an in-flight coach instead of dropping the correction", async () => {
    const work = { current: "2(x^2-8x)+5" };
    let releaseFirst!: (result: { speak: boolean; tip: string }) => void;
    const requestCoach = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<{ speak: boolean; tip: string }>((resolve) => {
            releaseFirst = resolve;
          }),
      )
      .mockResolvedValueOnce({
        speak: true,
        tip: "Now, complete the square inside the parentheses.",
      });
    const onTip = vi.fn();
    const deps = {
      questionUUId: "q",
      mode: "text" as const,
      source: "board" as const,
      getStudentWork: () => work.current,
      requestCoach,
      onTip,
    };

    schedulePracticeVoiceCoach(deps);
    await vi.advanceTimersByTimeAsync(4500);
    expect(requestCoach).toHaveBeenCalledTimes(1);

    work.current = "2(x^2-4x)+5";
    schedulePracticeVoiceCoach(deps);
    await vi.advanceTimersByTimeAsync(4500);
    expect(requestCoach).toHaveBeenCalledTimes(1);

    releaseFirst({
      speak: true,
      tip: "The coefficient inside should be 4, not 8.",
    });
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(400);
    expect(onTip).toHaveBeenCalledWith(
      "Now, complete the square inside the parentheses.",
    );
    expect(onTip).not.toHaveBeenCalledWith(
      "The coefficient inside should be 4, not 8.",
    );
    expect(requestCoach).toHaveBeenCalledTimes(2);
  });

  it("does not re-request the same work", async () => {
    const work = { current: "2(x^2-4x)+5" };
    const { requestCoach, deps } = boardCoach(work);

    schedulePracticeVoiceCoach(deps);
    await vi.advanceTimersByTimeAsync(4500);
    schedulePracticeVoiceCoach(deps);
    await vi.advanceTimersByTimeAsync(4500);
    expect(requestCoach).toHaveBeenCalledTimes(1);
  });
});
