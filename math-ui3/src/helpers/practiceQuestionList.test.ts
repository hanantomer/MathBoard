import { describe, expect, it } from "vitest";
import { PRACTICE_QUESTION_TEMPLATES } from "common/practiceQuestionTemplates";
import { practiceListItemsFromTemplates } from "./practiceQuestionList";

describe("practiceListItemsFromTemplates", () => {
  it("fills Algebra immediately from bundled templates", () => {
    const items = practiceListItemsFromTemplates("Algebra");
    const algebraTemplates = PRACTICE_QUESTION_TEMPLATES.filter(
      (t) => t.subject === "Algebra",
    );
    expect(items.size).toBe(algebraTemplates.length);
    expect(items.size).toBeGreaterThan(0);
    expect([...items.values()][0].name).toBe(algebraTemplates[0].name);
  });

  it("does not include other subjects", () => {
    const items = practiceListItemsFromTemplates("Geometry");
    for (const row of items.values()) {
      expect(row.subject).toBe("Geometry");
    }
  });
});
