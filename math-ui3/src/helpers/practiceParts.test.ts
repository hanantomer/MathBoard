import { describe, expect, it } from "vitest";
import {
  ACTIVE_LINE_PREFIX,
  ensureNumberedParts,
  formatPracticePartsBlock,
  formatPracticeStudentWorkLines,
  formatStudentWorkByParts,
  normalizeExtractedParts,
  parsePracticeProblemParts,
  practiceProblemPreamble,
  promotePracticePartHeader,
  stripPracticeTutorMarkup,
  workForActivePart,
  workForActivePartReview,
} from "common/practiceParts";
import {
  formatPracticeProblemPrompt,
  PRACTICE_QUESTION_TEMPLATES,
} from "common/practiceQuestionTemplates";

const QUADRATIC = [
  "A quadratic function is given by f(x) = 2x^2 - 8x + 5",
  "1. Write the function in vertex form.",
  "2. State the coordinates of the vertex.",
  "3. Determine the axis of symmetry.",
  "4. Find the y-intercept.",
  "5. Sketch a rough graph of the parabola.",
  "6. Determine whether the function has a maximum or a minimum value.",
].join("\n");

describe("parsePracticeProblemParts", () => {
  it("reads numbered lines from a multi-part stem", () => {
    const parts = parsePracticeProblemParts(QUADRATIC);
    expect(parts.map((p) => p.id)).toEqual(["1", "2", "3", "4", "5", "6"]);
    expect(parts[0].text).toMatch(/vertex form/i);
    expect(parts[1].text).toMatch(/coordinates of the vertex/i);
  });

  it("reads lettered (a) (b) parts", () => {
    const parts = parsePracticeProblemParts(
      "Solve.\n(a) Find x.\n(b) Find y.",
    );
    expect(parts).toEqual([
      { id: "a", text: "Find x." },
      { id: "b", text: "Find y." },
    ]);
  });

  it("reads inline 1. 2. in a single paragraph", () => {
    const parts = parsePracticeProblemParts(
      "Given f(x)=2x^2-8x+5 1. Write vertex form. 2. State the vertex.",
    );
    expect(parts).toHaveLength(2);
    expect(parts[0].id).toBe("1");
    expect(parts[1].id).toBe("2");
  });

  it("returns empty for a single-part question", () => {
    expect(parsePracticeProblemParts("Solve 2x + 3 = 11")).toEqual([]);
    expect(
      parsePracticeProblemParts("1. The only instruction."),
    ).toEqual([]);
  });

  it("treats unnumbered task rows as parts and skips the given line", () => {
    const parts = parsePracticeProblemParts(
      [
        "A quadratic function is given by f(x) = 2x^2 - 8x + 5",
        "Write the function in vertex form.",
        "State the coordinates of the vertex.",
        "Determine the axis of symmetry.",
      ].join("\n"),
    );
    expect(parts.map((p) => p.id)).toEqual(["1", "2", "3"]);
    expect(parts[0].text).toMatch(/vertex form/i);
    expect(parts.map((p) => p.text).join(" ")).not.toMatch(/given by/i);
  });

  it("treats short unnumbered prompt rows as parts", () => {
    const parts = parsePracticeProblemParts(
      ["Vertex form", "Coordinates of the vertex", "Axis of symmetry"].join(
        "\n",
      ),
    );
    expect(parts).toHaveLength(3);
    expect(parts[1].text).toMatch(/coordinates/i);
  });

  it("does not split a wrapped single question", () => {
    expect(
      parsePracticeProblemParts(
        [
          "A rectangle has length 8",
          "and width 6.",
          "Find the area.",
        ].join("\n"),
      ),
    ).toEqual([]);
  });
});

describe("formatPracticePartsBlock", () => {
  it("is empty unless there are at least two parts", () => {
    expect(formatPracticePartsBlock([])).toBe("");
    expect(
      formatPracticePartsBlock([{ id: "1", text: "Only one" }]),
    ).toBe("");
  });

  it("lists parts for the coach prompt", () => {
    const block = formatPracticePartsBlock(
      parsePracticeProblemParts(QUADRATIC),
    );
    expect(block).toMatch(/6 parts/);
    expect(block).toMatch(/\(1\) Write the function in vertex form\./);
  });
});

describe("promotePracticePartHeader", () => {
  it("promotes 1. and (2) labels", () => {
    expect(promotePracticePartHeader("1. f(x)=2(x-2)^2-3")).toBe(
      "[Part 1] f(x)=2(x-2)^2-3",
    );
    expect(promotePracticePartHeader("(2) (2,-3)")).toBe(
      "[Part 2] (2,-3)",
    );
    expect(promotePracticePartHeader("(4)y=5")).toBe("[Part 4] y=5");
    expect(promotePracticePartHeader("1.")).toBe("[Part 1]");
  });

  it("does not treat 1.5 or coordinates as a part label", () => {
    expect(promotePracticePartHeader("1.5")).toBe("1.5");
    expect(promotePracticePartHeader("(2,-3)")).toBe("(2,-3)");
    expect(promotePracticePartHeader("(0,5)")).toBe("(0,5)");
  });
});

describe("formatPracticeStudentWorkLines", () => {
  it("marks the active line and promotes a part header", () => {
    const text = formatPracticeStudentWorkLines(
      ["f(x)=2x^2-8x+5", "1. 2(x^2-4x+4)-8+5"],
      1,
    );
    expect(text).toBe(
      `f(x)=2x^2-8x+5\n${ACTIVE_LINE_PREFIX} [Part 1] 2(x^2-4x+4)-8+5`,
    );
  });
});

describe("stripPracticeTutorMarkup", () => {
  it("removes active and part markers for algebra parsing", () => {
    expect(
      stripPracticeTutorMarkup(
        "<<active>> [Part 1] f(x)=2(x-2)^2-3",
      ),
    ).toMatch(/f\(x\)=2\(x-2\)\^2-3/);
  });
});

describe("ensureNumberedParts", () => {
  it("keeps a parsed multi-part stem", () => {
    const parts = ensureNumberedParts(QUADRATIC);
    expect(parts).toHaveLength(6);
    expect(parts[0].id).toBe("1");
  });

  it("falls back to a single Whole problem section", () => {
    expect(ensureNumberedParts("Solve 2x + 3 = 11")).toEqual([
      { id: "1", text: "Whole problem" },
    ]);
    expect(ensureNumberedParts("")).toEqual([
      { id: "1", text: "Whole problem" },
    ]);
  });
});

describe("practiceProblemPreamble", () => {
  it("keeps the given line and drops numbered tasks", () => {
    const parts = parsePracticeProblemParts(QUADRATIC);
    expect(practiceProblemPreamble(QUADRATIC, parts)).toBe(
      "A quadratic function is given by f(x) = 2x^2 - 8x + 5",
    );
  });

  it("keeps setup before inline numbered tasks", () => {
    const text =
      "Given f(x)=2x^2-8x+5 1. Write vertex form. 2. State the vertex.";
    const parts = parsePracticeProblemParts(text);
    expect(practiceProblemPreamble(text, parts)).toBe("Given f(x)=2x^2-8x+5");
  });

  it("returns the full stem when there is only one part", () => {
    expect(
      practiceProblemPreamble("Solve 2x + 3 = 11", [
        { id: "1", text: "Whole problem" },
      ]),
    ).toBe("Solve 2x + 3 = 11");
  });
});

describe("normalizeExtractedParts", () => {
  it("renumbers lettered OCR ids to 1..n", () => {
    expect(
      normalizeExtractedParts([
        { id: "a", text: "Find x" },
        { id: "b", text: "Find y" },
      ]),
    ).toEqual([
      { id: "1", text: "Find x" },
      { id: "2", text: "Find y" },
    ]);
  });

  it("returns Whole problem when empty", () => {
    expect(normalizeExtractedParts([])).toEqual([
      { id: "1", text: "Whole problem" },
    ]);
  });
});

describe("formatStudentWorkByParts", () => {
  it("groups labeled lines and marks the active part", () => {
    const text = formatStudentWorkByParts(
      ["scratch 2(x^2-4x)", "(1) f(x)=2(x-2)^2-3", "(2) (2,-3)"],
      "2",
    );
    expect(text).toBe(
      [
        "[Part 1]",
        "f(x)=2(x-2)^2-3",
        "[Part 2]",
        `${ACTIVE_LINE_PREFIX} (2,-3)`,
        "unlabeled:",
        "scratch 2(x^2-4x)",
      ].join("\n"),
    );
  });

  it("keeps a quadratic worksheet's y-intercept in part 4", () => {
    const text = formatStudentWorkByParts(
      [
        "(1) f(x)=2x^2-8x+5",
        "f(x)=2(x^2-4x)+5",
        "f(x)=2(x-2)^2-3",
        "(2) [2,-3]",
        "(3) x=-b/2a=8/4=2",
        "(4) y=5 => [0,5]",
      ],
      "4",
    );
    expect(workForActivePart(text, "1")).toContain("2(x-2)^2-3");
    expect(workForActivePart(text, "3")).toContain("x=-b/2a");
    expect(workForActivePart(text, "3")).not.toContain("y=5");
    expect(workForActivePart(text, "4")).toContain("y=5");
    expect(workForActivePart(text, "4")).toContain("[0,5]");
  });

  it("reads (4)y=5 without a space after the label", () => {
    const text = formatStudentWorkByParts(["(4)y=5"], "4");
    expect(workForActivePart(text, "4")).toContain("y=5");
  });

  it("does not steal a coordinate into a fake part", () => {
    const text = formatStudentWorkByParts(
      ["(3) x=2", "(0,5)", "(4) y=5"],
      "4",
    );
    expect(workForActivePart(text, "3")).toContain("(0,5)");
    expect(workForActivePart(text, "3")).toContain("x=2");
    expect(workForActivePart(text, "4")).toContain("y=5");
    expect(text).not.toMatch(/\[Part 0\]/);
  });

  it("emits a placeholder when the active part has no labeled line", () => {
    const text = formatStudentWorkByParts(["2(x^2-4x)"], "1");
    expect(text).toContain(`${ACTIVE_LINE_PREFIX} (none yet for part 1)`);
    expect(text).toContain("unlabeled:");
  });
});

describe("workForActivePart", () => {
  it("returns only the active part body", () => {
    const blob = formatStudentWorkByParts(
      ["(1) vertex", "(2) (2,-3)"],
      "2",
    );
    expect(workForActivePart(blob, "2")).toContain("(2,-3)");
    expect(workForActivePart(blob, "2")).not.toContain("vertex");
  });
});

describe("workForActivePartReview", () => {
  it("includes unlabeled scratch with the first part", () => {
    const blob = [
      "[Part 1]",
      "<<active>> (none yet for part 1)",
      "unlabeled:",
      "f(x)=2(x^2-4x)+5",
      "f(x)=2(x-2)^2-3",
    ].join("\n");
    const review = workForActivePartReview(blob, "1");
    expect(review).toContain("2(x-2)^2-3");
    expect(review).not.toMatch(/none yet/i);
  });

  it("does not mix unlabeled scratch into a later part", () => {
    const blob = [
      "[Part 1]",
      "f(x)=2(x-2)^2-3",
      "[Part 2]",
      "<<active>> (none yet for part 2)",
      "unlabeled:",
      "scratch 2(x^2-4x)+5",
    ].join("\n");
    expect(workForActivePartReview(blob, "2")).not.toContain("2(x^2-4x)");
    expect(workForActivePartReview(blob, "1")).toContain("2(x^2-4x)+5");
  });
});

describe("formatPracticeProblemPrompt", () => {
  it("keeps a linear equation on one line instead of one character per row", () => {
    const template = PRACTICE_QUESTION_TEMPLATES.find(
      (t) => t.id === "algebra-linear-2x-plus-3",
    )!;
    const prompt = formatPracticeProblemPrompt(template);
    expect(prompt).toContain("Solve 2x + 3 = 11");
    expect(prompt).toContain("Solve for x:");
    expect(prompt).toMatch(/2x\+3=11/);
    expect(prompt.split("\n")).not.toContain("2");
    expect(ensureNumberedParts(prompt)).toEqual([
      { id: "1", text: "Whole problem" },
    ]);
  });
});
