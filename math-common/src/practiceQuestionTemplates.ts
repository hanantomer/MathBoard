import type { PracticeSubject } from "./practiceSubjects";
import {
  type LessonTemplateNotation,
  sym,
  text,
  line,
  ann,
  exp,
} from "./lessonTemplates";

export type PracticeQuestionTemplate = {
  /** Stable question board uuid in the database. */
  uuid: string;
  id: string;
  subject: PracticeSubject;
  name: string;
  /** Canonical answer used for automated practice feedback. */
  expectedAnswer: string;
  /** Optional alternate accepted forms (e.g. factored order). */
  acceptedAnswers?: string[];
  notations: LessonTemplateNotation[];
};

/** Curated practice stems — synced via seeders/seed.bat (with users). */
export const PRACTICE_QUESTION_TEMPLATES: PracticeQuestionTemplate[] = [
  {
    id: "algebra-linear-2x-plus-3",
    uuid: "a1000001-0000-4000-8000-000000000001",
    subject: "Algebra",
    name: "Solve 2x + 3 = 11",
    expectedAnswer: "x = 4",
    acceptedAnswers: ["x=4", "4"],
    notations: [
      text(2, 28, 1, 2, "Solve for x:"),
      sym(2, 5, "2"),
      sym(3, 5, "x"),
      sym(4, 5, "+"),
      sym(5, 5, "3"),
      sym(6, 5, "="),
      sym(7, 5, "1"),
      sym(8, 5, "1"),
    ],
  },
  {
    id: "algebra-factor-quadratic",
    uuid: "a1000001-0000-4000-8000-000000000002",
    subject: "Algebra",
    name: "Factor x² − 5x + 6",
    expectedAnswer: "(x - 2)(x - 3)",
    acceptedAnswers: ["(x-2)(x-3)", "(x - 3)(x - 2)", "(x-3)(x-2)"],
    notations: [
      text(2, 30, 1, 2, "Factor completely:"),
      sym(2, 5, "x"),
      exp(3, 5, "2"),
      sym(4, 5, "-"),
      sym(5, 5, "5"),
      sym(6, 5, "x"),
      sym(7, 5, "+"),
      sym(8, 5, "6"),
    ],
  },
  {
    id: "geometry-triangle-area",
    uuid: "a1000002-0000-4000-8000-000000000001",
    subject: "Geometry",
    name: "Area of a triangle",
    expectedAnswer: "24",
    acceptedAnswers: ["24 square units", "area = 24"],
    notations: [
      text(2, 38, 1, 2, "Find the area of the triangle."),
      // Shift triangle up by 150px (row height ≈ 33px → Δrow ≈ 4.545)
      line(10, 24 - 150 / 33, 30, 24 - 150 / 33),
      line(10, 24 - 150 / 33, 20, 10 - 150 / 33),
      line(20, 10 - 150 / 33, 30, 24 - 150 / 33),
      ann(19, 25 - 150 / 33, "base=8"),
      ann(21, 17 - 150 / 33, "h = 6"),
    ],
  },
  {
    id: "geometry-pythagorean-hypotenuse",
    uuid: "a1000002-0000-4000-8000-000000000002",
    subject: "Geometry",
    name: "Pythagorean theorem — find the hypotenuse",
    expectedAnswer: "5",
    acceptedAnswers: ["c = 5", "c=5"],
    notations: [
      text(2, 40, 1, 2, "Find the length of the hypotenuse."),
      line(8, 22, 32, 22),
      line(8, 22, 8, 8),
      line(8, 8, 32, 22),
      sym(6, 22, "C"),
      sym(33, 22, "B"),
      sym(6, 7, "A"),
      ann(9, 22, "90°"),
      ann(6, 15, "a = 3"),
      ann(19, 23, "b = 4"),
      ann(21, 14, "c = ?"),
    ],
  },
  {
    id: "trig-exact-values-30-60",
    uuid: "a1000003-0000-4000-8000-000000000001",
    subject: "Trigonometry",
    name: "sin(30°) and cos(60°)",
    expectedAnswer: "sin(30°)=1/2, cos(60°)=1/2",
    acceptedAnswers: ["1/2 and 1/2", "sin 30 = 1/2, cos 60 = 1/2"],
    notations: [
      text(2, 36, 1, 2, "Find exact values (no calculator):"),
      text(2, 28, 4, 5, "sin(30°) ="),
      text(2, 28, 7, 8, "cos(60°) ="),
    ],
  },
  {
    id: "trig-right-triangle-ratios",
    uuid: "a1000003-0000-4000-8000-000000000002",
    subject: "Trigonometry",
    name: "Solve a right triangle",
    expectedAnswer: "sin θ = 3/5, cos θ = 4/5, tan θ = 3/4",
    acceptedAnswers: ["sin=3/5, cos=4/5, tan=3/4"],
    notations: [
      text(2, 40, 1, 2, "For angle θ at B, find sin θ, cos θ, and tan θ."),
      line(8, 22, 32, 22),
      line(8, 22, 8, 8),
      line(8, 8, 32, 22),
      sym(6, 22, "C"),
      sym(33, 22, "B"),
      sym(6, 7, "A"),
      ann(9, 22, "90°"),
      ann(31, 20, "θ"),
      ann(6, 15, "opp = 3"),
      ann(19, 23, "adj = 4"),
      ann(21, 14, "hyp = 5"),
    ],
  },
  {
    id: "calculus-derivative-power",
    uuid: "a1000004-0000-4000-8000-000000000001",
    subject: "Calculus",
    name: "Derivative of x³",
    expectedAnswer: "3x²",
    acceptedAnswers: ["3x^2", "3x2"],
    notations: [
      text(2, 32, 1, 2, "Differentiate with respect to x:"),
      sym(2, 5, "d"),
      sym(3, 5, "/"),
      sym(4, 5, "d"),
      sym(5, 5, "x"),
      sym(6, 5, "("),
      sym(7, 5, "x"),
      sym(8, 5, "3"),
      sym(9, 5, ")"),
    ],
  },
  {
    id: "calculus-integral-power",
    uuid: "a1000004-0000-4000-8000-000000000002",
    subject: "Calculus",
    name: "Evaluate ∫ x dx",
    expectedAnswer: "(1/2)x² + C",
    acceptedAnswers: ["x²/2 + C", "x^2/2 + C", "(1/2)x^2 + C"],
    notations: [
      text(2, 32, 1, 2, "Evaluate the indefinite integral:"),
      sym(2, 5, "∫"),
      sym(3, 5, "x"),
      sym(4, 5, "d"),
      sym(5, 5, "x"),
    ],
  },
  {
    id: "statistics-mean",
    uuid: "a1000005-0000-4000-8000-000000000001",
    subject: "Statistics",
    name: "Mean of a data set",
    expectedAnswer: "8",
    acceptedAnswers: ["mean = 8"],
    notations: [
      text(2, 40, 1, 2, "Find the mean of the data set:"),
      text(2, 24, 4, 5, "4,  6,  8,  10,  12"),
    ],
  },
  {
    id: "statistics-independent-events",
    uuid: "a1000005-0000-4000-8000-000000000002",
    subject: "Statistics",
    name: "Probability of two independent events",
    expectedAnswer: "1/8",
    acceptedAnswers: ["0.125", "P = 1/8"],
    notations: [
      text(2, 44, 1, 3, "A fair coin is tossed twice, then a fair die is rolled."),
      text(2, 44, 5, 6, "Events are independent. Find P(heads, heads, even)."),
    ],
  },
  {
    id: "general-order-of-operations",
    uuid: "a1000006-0000-4000-8000-000000000001",
    subject: "General",
    name: "Order of operations",
    expectedAnswer: "11",
    acceptedAnswers: ["3 + 8 = 11"],
    notations: [
      text(2, 30, 1, 2, "Evaluate:"),
      sym(2, 5, "3"),
      sym(3, 5, "+"),
      sym(4, 5, "4"),
      sym(5, 5, "×"),
      sym(6, 5, "2"),
      sym(7, 5, "2"),
    ],
  },
  {
    id: "general-percent-increase",
    uuid: "a1000006-0000-4000-8000-000000000002",
    subject: "General",
    name: "Percent increase and decrease",
    expectedAnswer: "25%",
    acceptedAnswers: ["25 percent", "0.25"],
    notations: [
      text(2, 44, 1, 3, "A store price increases from $40 to $50."),
      text(2, 36, 5, 6, "What is the percent increase?"),
    ],
  },
];

export function getPracticeQuestionTemplate(
  id: string,
): PracticeQuestionTemplate | undefined {
  return PRACTICE_QUESTION_TEMPLATES.find((t) => t.id === id);
}

export function getPracticeQuestionTemplateByUUId(
  uuid: string,
): PracticeQuestionTemplate | undefined {
  return PRACTICE_QUESTION_TEMPLATES.find((t) => t.uuid === uuid);
}

/** Flatten stem text/symbols into a short problem description for grading. */
export function formatPracticeProblemPrompt(
  template: PracticeQuestionTemplate,
): string {
  const parts: string[] = [`Problem: ${template.name}`];
  for (const item of template.notations) {
    switch (item.kind) {
      case "TEXT":
      case "ANNOTATION":
        parts.push(item.value);
        break;
      case "SYMBOL":
      case "EXPONENT":
        parts.push(item.value);
        break;
      default:
        break;
    }
  }
  return parts.join("\n");
}
