import type { PracticeSubject } from "./practiceSubjects";
import type { PracticeProblemPart } from "./practiceParts";
import {
  type LessonTemplateNotation,
  sym,
  text,
  line,
  ann,
  exp,
  circle,
} from "./lessonTemplates";

export type PracticeDifficulty = "intro" | "core" | "challenge";

export const PRACTICE_DIFFICULTY_ORDER: PracticeDifficulty[] = [
  "intro",
  "core",
  "challenge",
];

export const PRACTICE_DIFFICULTY_LABEL: Record<PracticeDifficulty, string> = {
  intro: "Intro",
  core: "Core",
  challenge: "Challenge",
};

export type PracticeTemplatePart = {
  id: string;
  text: string;
  expectedAnswer: string;
  acceptedAnswers?: string[];
  /** Progressive hints for this task only; never state the answer. */
  hints?: string[];
};

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
  /** Authored problem statement. Fallback flattens notations. */
  prompt?: string;
  difficulty?: PracticeDifficulty;
  tags?: string[];
  /** Progressive hints that never state the answer. */
  hints?: string[];
  /** Short method note after a correct check (all parts, if multi-part). */
  explanation?: string;
  /** Explicit multi-part items with per-part answer keys. */
  parts?: PracticeTemplatePart[];
};

const DIAGRAM_STEM_KINDS = new Set([
  "LINE",
  "CURVE",
  "CIRCLE",
  "CONIC",
  "ANNOTATION",
]);

/** Curated practice stems — synced via seeders/seed.bat (with users). */
export const PRACTICE_QUESTION_TEMPLATES: PracticeQuestionTemplate[] = [
  {
    id: "algebra-linear-2x-plus-3",
    uuid: "a1000001-0000-4000-8000-000000000001",
    subject: "Algebra",
    name: "Solve 2x + 3 = 11",
    difficulty: "intro",
    tags: ["linear", "one-step"],
    expectedAnswer: "x = 4",
    acceptedAnswers: ["x=4", "4"],
    prompt: "Solve 2x + 3 = 11\nSolve for x:\n2x+3=11",
    hints: [
      "Undo addition first so the x term is alone.",
      "Then divide both sides by the coefficient of x.",
    ],
    explanation: "Subtract 3 from both sides to get 2x = 8, then divide by 2.",
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
    difficulty: "core",
    tags: ["quadratic", "factoring"],
    expectedAnswer: "(x - 2)(x - 3)",
    acceptedAnswers: ["(x-2)(x-3)", "(x - 3)(x - 2)", "(x-3)(x-2)"],
    prompt: "Factor x² − 5x + 6\nFactor completely:\nx^2-5x+6",
    hints: [
      "Find two numbers that multiply to 6 and add to −5.",
      "Both factors will be of the form (x − n).",
    ],
    explanation: "2 and 3 multiply to 6 and add to 5, so the signs are both minus.",
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
    id: "algebra-system-two-equations",
    uuid: "a1000001-0000-4000-8000-000000000003",
    subject: "Algebra",
    name: "Solve the system 2x + y = 7, x − y = 2",
    difficulty: "core",
    tags: ["systems", "linear"],
    expectedAnswer: "x = 3, y = 1",
    acceptedAnswers: ["x=3, y=1", "(3, 1)", "(3,1)", "y=1, x=3"],
    prompt:
      "Solve the system 2x + y = 7, x − y = 2\nSolve for x and y:\n2x + y = 7\nx − y = 2",
    hints: [
      "Adding the two equations cancels y.",
      "Once you have x, substitute back into either equation.",
    ],
    explanation: "Add the equations to get 3x = 9, so x = 3. Then y = 7 − 6 = 1.",
    notations: [
      text(2, 36, 1, 2, "Solve the system:"),
      text(2, 28, 4, 5, "2x + y = 7"),
      text(2, 28, 7, 8, "x − y = 2"),
    ],
  },
  {
    id: "algebra-quadratic-vertex-form",
    uuid: "a1000001-0000-4000-8000-000000000004",
    subject: "Algebra",
    name: "Vertex form of a quadratic",
    difficulty: "challenge",
    tags: ["quadratic", "vertex", "parabola"],
    expectedAnswer: "2(x-2)^2-3",
    acceptedAnswers: [
      "2(x - 2)^2 - 3",
      "f(x)=2(x-2)^2-3",
      "f(x) = 2(x - 2)^2 - 3",
    ],
    prompt: [
      "Vertex form of a quadratic",
      "A quadratic function is given by f(x) = 2x^2 - 8x + 5",
      "1. Write the function in vertex form.",
      "2. State the coordinates of the vertex.",
      "3. Determine the axis of symmetry.",
      "4. Find the y-intercept.",
      "5. Sketch a rough graph of the parabola.",
    ].join("\n"),
    hints: [
      "Factor 2 out of the x terms before completing the square.",
      "The vertex is (h, k) from a(x − h)² + k.",
    ],
    explanation:
      "Complete the square: 2(x² − 4x) + 5 = 2((x − 2)² − 4) + 5 = 2(x − 2)² − 3.",
    parts: [
      {
        id: "1",
        text: "Write the function in vertex form.",
        expectedAnswer: "2(x-2)^2-3",
        acceptedAnswers: ["2(x - 2)^2 - 3", "f(x)=2(x-2)^2-3"],
        hints: [
          "Factor 2 out of the x terms before completing the square.",
        ],
      },
      {
        id: "2",
        text: "State the coordinates of the vertex.",
        expectedAnswer: "(2, -3)",
        acceptedAnswers: ["(2,-3)", "vertex (2, -3)"],
        hints: ["The vertex is (h, k) from a(x − h)² + k."],
      },
      {
        id: "3",
        text: "Determine the axis of symmetry.",
        expectedAnswer: "x = 2",
        acceptedAnswers: ["x=2"],
        hints: ["The axis of symmetry is the vertical line through the vertex."],
      },
      {
        id: "4",
        text: "Find the y-intercept.",
        expectedAnswer: "(0, 5)",
        acceptedAnswers: ["(0,5)", "f(0)=5", "f(0) = 5"],
        hints: [
          "The y-intercept is f(0). Write it as a point on the y-axis, not only y = a number.",
        ],
      },
      {
        id: "5",
        text: "Sketch a rough graph of the parabola.",
        expectedAnswer: "parabola opens up",
        acceptedAnswers: ["opens up", "minimum at (2, -3)"],
        hints: [
          "Plot the vertex, axis, and y-intercept. The parabola opens the same way as the sign of a.",
        ],
      },
    ],
    notations: [
      text(2, 44, 1, 2, "A quadratic function is given by f(x) = 2x² − 8x + 5"),
      text(2, 40, 4, 5, "1. Write the function in vertex form."),
      text(2, 40, 7, 8, "2. State the coordinates of the vertex."),
      text(2, 40, 10, 11, "3. Determine the axis of symmetry."),
      text(2, 36, 13, 14, "4. Find the y-intercept."),
      text(2, 44, 16, 17, "5. Sketch a rough graph of the parabola."),
    ],
  },
  {
    id: "geometry-triangle-area",
    uuid: "a1000002-0000-4000-8000-000000000001",
    subject: "Geometry",
    name: "Area of a triangle",
    difficulty: "intro",
    tags: ["area", "triangle"],
    expectedAnswer: "24",
    acceptedAnswers: ["24 square units", "area = 24"],
    prompt:
      "Area of a triangle\nFind the area of the triangle.\nGiven:\nbase=8\nh = 6",
    hints: [
      "Area of a triangle is one-half base times height.",
      "Here the base is 8 and the height is 6.",
    ],
    explanation: "A = (1/2) × 8 × 6 = 24.",
    notations: [
      text(2, 38, 1, 2, "Find the area of the triangle."),
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
    difficulty: "core",
    tags: ["pythagorean", "right-triangle"],
    expectedAnswer: "5",
    acceptedAnswers: ["c = 5", "c=5"],
    prompt:
      "Pythagorean theorem — find the hypotenuse\nIn △ABC, find the length of hypotenuse c.\nGiven:\n∠C = 90°\na = 3\nb = 4\nc = ?",
    hints: [
      "In a right triangle, a² + b² = c².",
      "Square both legs, add, then take the square root.",
    ],
    explanation: "3² + 4² = 9 + 16 = 25, so c = 5.",
    notations: [
      text(2, 44, 1, 2, "In △ABC, find the length of hypotenuse c."),
      line(8, 22, 32, 22),
      line(8, 22, 8, 8),
      line(8, 8, 32, 22),
      sym(6, 22, "C"),
      sym(33, 22, "B"),
      sym(6, 7, "A"),
      ann(9, 22, "∠C = 90°"),
      ann(6, 15, "a = 3"),
      ann(19, 23, "b = 4"),
      ann(21, 14, "c = ?"),
    ],
  },
  {
    id: "geometry-circle-circumference",
    uuid: "a1000002-0000-4000-8000-000000000003",
    subject: "Geometry",
    name: "Circumference of a circle",
    difficulty: "core",
    tags: ["circle", "circumference"],
    expectedAnswer: "10π",
    acceptedAnswers: ["10pi", "10π units", "C = 10π", "C=10π"],
    prompt:
      "Circumference of a circle\nThe circle has radius 5. Find the circumference. Leave π in the answer.\nGiven:\nr = 5",
    hints: [
      "Circumference is 2πr.",
      "Keep π in the answer instead of using a decimal.",
    ],
    explanation: "C = 2πr = 2π × 5 = 10π.",
    notations: [
      text(2, 44, 1, 2, "The circle has radius 5. Find the circumference."),
      circle(20, 16, 8),
      line(20, 16, 28, 16),
      ann(24, 15, "r = 5"),
    ],
  },
  {
    id: "trig-exact-values-30-60",
    uuid: "a1000003-0000-4000-8000-000000000001",
    subject: "Trigonometry",
    name: "sin(30°) and cos(60°)",
    difficulty: "intro",
    tags: ["exact-values", "unit-circle"],
    expectedAnswer: "sin(30°)=1/2, cos(60°)=1/2",
    acceptedAnswers: ["1/2 and 1/2", "sin 30 = 1/2, cos 60 = 1/2"],
    prompt:
      "sin(30°) and cos(60°)\nFind exact values (no calculator):\nsin(30°) =\ncos(60°) =",
    hints: [
      "These are special angles from a 30-60-90 triangle.",
      "sin 30° and cos 60° are the same exact value.",
    ],
    explanation: "Both equal 1/2.",
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
    difficulty: "core",
    tags: ["trig-ratios", "right-triangle"],
    expectedAnswer: "sin θ = 3/5, cos θ = 4/5, tan θ = 3/4",
    acceptedAnswers: ["sin=3/5, cos=4/5, tan=3/4"],
    prompt:
      "Solve a right triangle\nFor angle θ at B, find sin θ, cos θ, and tan θ.\nGiven:\n90°\nθ\nopp = 3\nadj = 4\nhyp = 5",
    hints: [
      "SOH-CAH-TOA: sine is opposite over hypotenuse.",
      "θ is at B, so the side opposite θ is AC = 3.",
    ],
    explanation: "sin θ = 3/5, cos θ = 4/5, tan θ = 3/4.",
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
    id: "trig-unit-circle-cos-0",
    uuid: "a1000003-0000-4000-8000-000000000003",
    subject: "Trigonometry",
    name: "cos(0°) on the unit circle",
    difficulty: "intro",
    tags: ["unit-circle", "exact-values"],
    expectedAnswer: "1",
    acceptedAnswers: ["cos(0°)=1", "cos 0 = 1"],
    prompt:
      "cos(0°) on the unit circle\nOn the unit circle, find the exact value of cos(0°).",
    hints: [
      "Cosine is the x-coordinate of the point on the unit circle.",
      "0° is the point (1, 0).",
    ],
    explanation: "The point at 0° is (1, 0), so cosine is 1.",
    notations: [
      text(2, 44, 1, 2, "On the unit circle, find the exact value of cos(0°)."),
      circle(22, 16, 7),
      line(14, 16, 30, 16),
      line(22, 9, 22, 23),
      ann(29, 15, "(1, 0)"),
    ],
  },
  {
    id: "calculus-derivative-power",
    uuid: "a1000004-0000-4000-8000-000000000001",
    subject: "Calculus",
    name: "Derivative of x³",
    difficulty: "intro",
    tags: ["derivative", "power-rule"],
    expectedAnswer: "3x²",
    acceptedAnswers: ["3x^2", "3x2"],
    prompt: "Derivative of x³\nDifferentiate with respect to x:\nd/dx(x^3)",
    hints: [
      "Power rule: bring the exponent down and subtract one from it.",
      "The derivative of xⁿ is n xⁿ⁻¹.",
    ],
    explanation: "d/dx(x³) = 3x².",
    notations: [
      text(2, 32, 1, 2, "Differentiate with respect to x:"),
      sym(2, 5, "d"),
      sym(3, 5, "/"),
      sym(4, 5, "d"),
      sym(5, 5, "x"),
      sym(6, 5, "("),
      sym(7, 5, "x"),
      exp(8, 5, "3"),
      sym(9, 5, ")"),
    ],
  },
  {
    id: "calculus-integral-power",
    uuid: "a1000004-0000-4000-8000-000000000002",
    subject: "Calculus",
    name: "Evaluate ∫ x dx",
    difficulty: "core",
    tags: ["integral", "indefinite-integral"],
    expectedAnswer: "(1/2)x² + C",
    acceptedAnswers: [
      "x²/2 + C",
      "x^2/2 + C",
      "(1/2)x^2 + C",
      "(x^2)/(2) + C",
      "(x²)/(2) + C",
    ],
    prompt: "Evaluate ∫ x dx\nEvaluate the indefinite integral:\n∫x dx",
    hints: [
      "Reverse the power rule: raise the power by 1, then divide by the new power.",
      "Indefinite integrals need a constant of integration.",
    ],
    explanation: "∫ x dx = (1/2)x² + C.",
    notations: [
      text(2, 32, 1, 2, "Evaluate the indefinite integral:"),
      sym(2, 5, "∫"),
      sym(3, 5, "x"),
      sym(4, 5, "d"),
      sym(5, 5, "x"),
    ],
  },
  {
    id: "calculus-chain-rule",
    uuid: "a1000004-0000-4000-8000-000000000003",
    subject: "Calculus",
    name: "Chain rule for (2x + 1)³",
    difficulty: "challenge",
    tags: ["derivative", "chain-rule"],
    expectedAnswer: "6(2x+1)^2",
    acceptedAnswers: [
      "6(2x + 1)^2",
      "6(2x+1)²",
      "3(2x+1)^2 * 2",
      "3(2x+1)^2·2",
    ],
    prompt:
      "Chain rule for (2x + 1)³\nDifferentiate with respect to x:\n(2x+1)^3",
    hints: [
      "The chain rule is outer derivative times inner derivative.",
      "The inner function is 2x + 1, whose derivative is 2.",
    ],
    explanation: "3(2x + 1)² · 2 = 6(2x + 1)².",
    notations: [
      text(2, 36, 1, 2, "Differentiate with respect to x:"),
      sym(2, 5, "("),
      sym(3, 5, "2"),
      sym(4, 5, "x"),
      sym(5, 5, "+"),
      sym(6, 5, "1"),
      sym(7, 5, ")"),
      exp(8, 5, "3"),
    ],
  },
  {
    id: "statistics-mean",
    uuid: "a1000005-0000-4000-8000-000000000001",
    subject: "Statistics",
    name: "Mean of a data set",
    difficulty: "intro",
    tags: ["mean", "average"],
    expectedAnswer: "8",
    acceptedAnswers: ["mean = 8"],
    prompt: "Mean of a data set\nFind the mean of the data set:\n4,  6,  8,  10,  12",
    hints: [
      "Mean is the sum of the values divided by how many there are.",
      "There are 5 numbers in this list.",
    ],
    explanation: "(4 + 6 + 8 + 10 + 12) / 5 = 40 / 5 = 8.",
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
    difficulty: "challenge",
    tags: ["probability", "independent"],
    expectedAnswer: "1/8",
    acceptedAnswers: ["0.125", "P = 1/8"],
    prompt:
      "Probability of two independent events\nA fair coin is tossed twice, then a fair die is rolled.\nEvents are independent. Find P(heads, heads, even).",
    hints: [
      "Independent events: multiply the separate probabilities.",
      "P(heads) = 1/2 and P(even on a die) = 1/2.",
    ],
    explanation: "(1/2) × (1/2) × (1/2) = 1/8.",
    notations: [
      text(2, 44, 1, 3, "A fair coin is tossed twice, then a fair die is rolled."),
      text(2, 44, 5, 6, "Events are independent. Find P(heads, heads, even)."),
    ],
  },
  {
    id: "statistics-median",
    uuid: "a1000005-0000-4000-8000-000000000003",
    subject: "Statistics",
    name: "Median of a data set",
    difficulty: "intro",
    tags: ["median", "center"],
    expectedAnswer: "7",
    acceptedAnswers: ["median = 7"],
    prompt: "Median of a data set\nFind the median of the data set:\n3,  12,  4,  9,  7",
    hints: [
      "Put the numbers in order first.",
      "The median is the middle value of the ordered list.",
    ],
    explanation: "Ordered: 3, 4, 7, 9, 12. The middle value is 7.",
    notations: [
      text(2, 40, 1, 2, "Find the median of the data set:"),
      text(2, 24, 4, 5, "3,  12,  4,  9,  7"),
    ],
  },
  {
    id: "general-order-of-operations",
    uuid: "a1000006-0000-4000-8000-000000000001",
    subject: "General",
    name: "Order of operations",
    difficulty: "intro",
    tags: ["pemdas", "arithmetic"],
    expectedAnswer: "11",
    acceptedAnswers: ["3 + 8 = 11"],
    prompt: "Order of operations\nEvaluate:\n3+4×2",
    hints: [
      "Multiply before you add.",
      "4 × 2 is 8, then add 3.",
    ],
    explanation: "3 + 4 × 2 = 3 + 8 = 11.",
    notations: [
      text(2, 30, 1, 2, "Evaluate:"),
      sym(2, 5, "3"),
      sym(3, 5, "+"),
      sym(4, 5, "4"),
      sym(5, 5, "×"),
      sym(6, 5, "2"),
    ],
  },
  {
    id: "general-percent-increase",
    uuid: "a1000006-0000-4000-8000-000000000002",
    subject: "General",
    name: "Percent increase and decrease",
    difficulty: "core",
    tags: ["percent", "word-problem"],
    expectedAnswer: "25%",
    acceptedAnswers: ["25 percent", "0.25"],
    prompt:
      "Percent increase and decrease\nA store price increases from $40 to $50.\nWhat is the percent increase?",
    hints: [
      "Percent increase is change divided by the original amount.",
      "The change is 10, and the original price is 40.",
    ],
    explanation: "(50 − 40) / 40 = 10/40 = 25%.",
    notations: [
      text(2, 44, 1, 3, "A store price increases from $40 to $50."),
      text(2, 36, 5, 6, "What is the percent increase?"),
    ],
  },
  {
    id: "general-fraction-of-quantity",
    uuid: "a1000006-0000-4000-8000-000000000003",
    subject: "General",
    name: "Fraction of a quantity",
    difficulty: "intro",
    tags: ["fractions", "word-problem"],
    expectedAnswer: "15",
    acceptedAnswers: ["15 apples", "3/4 of 20 = 15"],
    prompt:
      "Fraction of a quantity\nA bag has 20 apples. What is 3/4 of 20?",
    hints: [
      "Of means multiply: (3/4) × 20.",
      "You can also take 20 ÷ 4, then multiply by 3.",
    ],
    explanation: "(3/4) × 20 = 15.",
    notations: [
      text(2, 40, 1, 2, "A bag has 20 apples. What is 3/4 of 20?"),
    ],
  },
  {
    id: "algebra-linear-inequality",
    uuid: "a1000001-0000-4000-8000-000000000005",
    subject: "Algebra",
    name: "Solve 3x − 5 > 7",
    difficulty: "core",
    tags: ["inequality", "linear"],
    expectedAnswer: "x > 4",
    acceptedAnswers: ["x>4", "x > 4"],
    prompt: "Solve 3x − 5 > 7\nSolve the inequality:\n3x-5>7",
    hints: [
      "Add 5 to both sides first, same as an equation.",
      "Then divide by 3. The inequality direction stays the same.",
    ],
    explanation: "3x > 12, so x > 4.",
    notations: [
      text(2, 32, 1, 2, "Solve the inequality:"),
      text(2, 20, 4, 5, "3x − 5 > 7"),
    ],
  },
  {
    id: "algebra-expand-binomial",
    uuid: "a1000001-0000-4000-8000-000000000006",
    subject: "Algebra",
    name: "Expand (x + 2)(x + 3)",
    difficulty: "intro",
    tags: ["expand", "binomial"],
    expectedAnswer: "x^2 + 5x + 6",
    acceptedAnswers: ["x² + 5x + 6", "x^2+5x+6", "x²+5x+6"],
    prompt: "Expand (x + 2)(x + 3)\nExpand:\n(x+2)(x+3)",
    hints: [
      "Use FOIL or distribute each term in the first factor.",
      "The middle terms are 3x and 2x.",
    ],
    explanation: "x² + 3x + 2x + 6 = x² + 5x + 6.",
    notations: [
      text(2, 24, 1, 2, "Expand:"),
      text(2, 22, 4, 5, "(x + 2)(x + 3)"),
    ],
  },
  {
    id: "algebra-slope-two-points",
    uuid: "a1000001-0000-4000-8000-000000000007",
    subject: "Algebra",
    name: "Slope through (1, 2) and (3, 8)",
    difficulty: "core",
    tags: ["slope", "linear"],
    expectedAnswer: "3",
    acceptedAnswers: ["m = 3", "m=3", "6/2"],
    prompt:
      "Slope through (1, 2) and (3, 8)\nFind the slope of the line through (1, 2) and (3, 8).",
    hints: [
      "Slope is rise over run: (y₂ − y₁) / (x₂ − x₁).",
      "The y change is 6 and the x change is 2.",
    ],
    explanation: "m = (8 − 2) / (3 − 1) = 6/2 = 3.",
    notations: [
      text(2, 44, 1, 2, "Find the slope of the line through (1, 2) and (3, 8)."),
    ],
  },
  {
    id: "geometry-triangle-angle-sum",
    uuid: "a1000002-0000-4000-8000-000000000004",
    subject: "Geometry",
    name: "Missing angle in a triangle",
    difficulty: "intro",
    tags: ["triangle", "angles"],
    expectedAnswer: "70°",
    acceptedAnswers: ["70", "70 degrees"],
    prompt:
      "Missing angle in a triangle\nA triangle has angles 50° and 60°. Find the third angle.",
    hints: [
      "The three angles of a triangle add to 180°.",
      "Subtract 50° and 60° from 180°.",
    ],
    explanation: "180° − 50° − 60° = 70°.",
    notations: [
      text(2, 44, 1, 2, "A triangle has angles 50° and 60°. Find the third angle."),
      line(10, 22, 30, 22),
      line(10, 22, 20, 8),
      line(20, 8, 30, 22),
      ann(14, 20, "50°"),
      ann(24, 20, "60°"),
      ann(19, 12, "?"),
    ],
  },
  {
    id: "geometry-circle-area",
    uuid: "a1000002-0000-4000-8000-000000000005",
    subject: "Geometry",
    name: "Area of a circle",
    difficulty: "core",
    tags: ["circle", "area"],
    expectedAnswer: "9π",
    acceptedAnswers: ["9pi", "9π square units", "A = 9π", "A=9π"],
    prompt:
      "Area of a circle\nThe circle has radius 3. Find the area. Leave π in the answer.\nGiven:\nr = 3",
    hints: [
      "Area of a circle is πr².",
      "Keep π in the answer instead of using a decimal.",
    ],
    explanation: "A = πr² = π × 3² = 9π.",
    notations: [
      text(2, 40, 1, 2, "The circle has radius 3. Find the area."),
      circle(20, 16, 6),
      line(20, 16, 26, 16),
      ann(22, 15, "r = 3"),
    ],
  },
  {
    id: "geometry-similar-triangles",
    uuid: "a1000002-0000-4000-8000-000000000006",
    subject: "Geometry",
    name: "Similar triangles — missing side",
    difficulty: "core",
    tags: ["similar", "proportion"],
    expectedAnswer: "10",
    acceptedAnswers: ["x = 10", "x=10"],
    prompt:
      "Similar triangles — missing side\nThe triangles are similar. Matching sides 4 and 8, and 5 and x. Find x.",
    hints: [
      "Similar triangles have proportional matching sides.",
      "The scale factor from 4 to 8 is 2.",
    ],
    explanation: "8/4 = 2, so x = 2 × 5 = 10.",
    notations: [
      text(2, 44, 1, 2, "The triangles are similar. Find x."),
      line(8, 22, 18, 22),
      line(8, 22, 13, 12),
      line(13, 12, 18, 22),
      ann(12, 23, "4"),
      ann(16, 16, "5"),
      line(24, 22, 44, 22),
      line(24, 22, 34, 8),
      line(34, 8, 44, 22),
      ann(33, 23, "8"),
      ann(40, 14, "x"),
    ],
  },
  {
    id: "trig-tan-45",
    uuid: "a1000003-0000-4000-8000-000000000004",
    subject: "Trigonometry",
    name: "tan(45°)",
    difficulty: "intro",
    tags: ["exact-values", "tangent"],
    expectedAnswer: "1",
    acceptedAnswers: ["tan(45°)=1", "tan 45 = 1"],
    prompt: "tan(45°)\nFind the exact value of tan(45°). No calculator.",
    hints: [
      "tan θ = sin θ / cos θ.",
      "At 45° sine and cosine are equal.",
    ],
    explanation: "sin 45° = cos 45°, so tan 45° = 1.",
    notations: [
      text(2, 40, 1, 2, "Find the exact value of tan(45°). No calculator."),
    ],
  },
  {
    id: "trig-sin-90",
    uuid: "a1000003-0000-4000-8000-000000000005",
    subject: "Trigonometry",
    name: "sin(90°)",
    difficulty: "intro",
    tags: ["exact-values", "unit-circle"],
    expectedAnswer: "1",
    acceptedAnswers: ["sin(90°)=1", "sin 90 = 1"],
    prompt: "sin(90°)\nOn the unit circle, find the exact value of sin(90°).",
    hints: [
      "Sine is the y-coordinate of the point on the unit circle.",
      "90° is the top of the circle, the point (0, 1).",
    ],
    explanation: "The point at 90° is (0, 1), so sine is 1.",
    notations: [
      text(2, 44, 1, 2, "On the unit circle, find the exact value of sin(90°)."),
      circle(22, 16, 7),
      line(14, 16, 30, 16),
      line(22, 9, 22, 23),
      ann(23, 9, "(0, 1)"),
    ],
  },
  {
    id: "trig-acute-from-sine",
    uuid: "a1000003-0000-4000-8000-000000000006",
    subject: "Trigonometry",
    name: "Acute angle with sin θ = 1/2",
    difficulty: "core",
    tags: ["inverse", "special-angles"],
    expectedAnswer: "30°",
    acceptedAnswers: ["30", "θ = 30°", "theta = 30"],
    prompt:
      "Acute angle with sin θ = 1/2\nθ is acute and sin θ = 1/2. Find θ.",
    hints: [
      "This is a special angle from a 30-60-90 triangle.",
      "sin 30° = 1/2. Acute means between 0° and 90°.",
    ],
    explanation: "The acute angle with sine 1/2 is 30°.",
    notations: [
      text(2, 40, 1, 2, "θ is acute and sin θ = 1/2. Find θ."),
    ],
  },
  {
    id: "calculus-derivative-5x2",
    uuid: "a1000004-0000-4000-8000-000000000004",
    subject: "Calculus",
    name: "Derivative of 5x²",
    difficulty: "intro",
    tags: ["derivative", "power-rule"],
    expectedAnswer: "10x",
    acceptedAnswers: ["10 x", "d/dx = 10x"],
    prompt: "Derivative of 5x²\nDifferentiate with respect to x:\n5x^2",
    hints: [
      "Power rule: n xⁿ⁻¹, then multiply by the 5 in front.",
      "The derivative of x² is 2x.",
    ],
    explanation: "d/dx(5x²) = 5 · 2x = 10x.",
    notations: [
      text(2, 32, 1, 2, "Differentiate with respect to x:"),
      sym(2, 5, "5"),
      sym(3, 5, "x"),
      exp(4, 5, "2"),
    ],
  },
  {
    id: "calculus-product-rule",
    uuid: "a1000004-0000-4000-8000-000000000005",
    subject: "Calculus",
    name: "Product rule for x(x + 1)",
    difficulty: "core",
    tags: ["derivative", "product-rule"],
    expectedAnswer: "2x + 1",
    acceptedAnswers: ["2x+1", "1 + 2x"],
    prompt:
      "Product rule for x(x + 1)\nDifferentiate with respect to x:\nx(x+1)",
    hints: [
      "Product rule: u′v + uv′.",
      "You can also expand first: x² + x, then differentiate.",
    ],
    explanation: "Expand: x² + x. Then 2x + 1. Or product rule: 1·(x+1) + x·1.",
    notations: [
      text(2, 32, 1, 2, "Differentiate with respect to x:"),
      text(2, 18, 4, 5, "x(x + 1)"),
    ],
  },
  {
    id: "calculus-definite-integral",
    uuid: "a1000004-0000-4000-8000-000000000006",
    subject: "Calculus",
    name: "Evaluate ∫₀² 2x dx",
    difficulty: "core",
    tags: ["integral", "definite-integral"],
    expectedAnswer: "4",
    acceptedAnswers: ["4 units", "value = 4"],
    prompt:
      "Evaluate ∫₀² 2x dx\nEvaluate the definite integral from 0 to 2 of 2x dx.",
    hints: [
      "The antiderivative of 2x is x².",
      "Plug in the top limit, then subtract the bottom limit.",
    ],
    explanation: "[x²] from 0 to 2 = 4 − 0 = 4.",
    notations: [
      text(2, 44, 1, 2, "Evaluate the definite integral from 0 to 2 of 2x dx."),
      sym(2, 5, "∫"),
      sym(3, 5, "2"),
      sym(4, 5, "x"),
      sym(5, 5, "d"),
      sym(6, 5, "x"),
    ],
  },
  {
    id: "statistics-range",
    uuid: "a1000005-0000-4000-8000-000000000004",
    subject: "Statistics",
    name: "Range of a data set",
    difficulty: "intro",
    tags: ["range", "spread"],
    expectedAnswer: "9",
    acceptedAnswers: ["range = 9"],
    prompt: "Range of a data set\nFind the range of the data set:\n3,  12,  4,  9,  7",
    hints: [
      "Range is the largest value minus the smallest.",
      "The largest is 12 and the smallest is 3.",
    ],
    explanation: "12 − 3 = 9.",
    notations: [
      text(2, 40, 1, 2, "Find the range of the data set:"),
      text(2, 24, 4, 5, "3,  12,  4,  9,  7"),
    ],
  },
  {
    id: "statistics-mode",
    uuid: "a1000005-0000-4000-8000-000000000005",
    subject: "Statistics",
    name: "Mode of a data set",
    difficulty: "intro",
    tags: ["mode", "center"],
    expectedAnswer: "5",
    acceptedAnswers: ["mode = 5"],
    prompt: "Mode of a data set\nFind the mode of the data set:\n2,  5,  3,  5,  7,  5,  2",
    hints: [
      "The mode is the value that appears most often.",
      "Count how many times each number shows up.",
    ],
    explanation: "5 appears three times, more than any other value.",
    notations: [
      text(2, 40, 1, 2, "Find the mode of the data set:"),
      text(2, 28, 4, 5, "2,  5,  3,  5,  7,  5,  2"),
    ],
  },
  {
    id: "statistics-die-even",
    uuid: "a1000005-0000-4000-8000-000000000006",
    subject: "Statistics",
    name: "Probability of an even roll",
    difficulty: "intro",
    tags: ["probability", "sample-space"],
    expectedAnswer: "1/2",
    acceptedAnswers: ["0.5", "3/6", "P = 1/2"],
    prompt:
      "Probability of an even roll\nA fair six-sided die is rolled. Find P(even).",
    hints: [
      "Even faces are 2, 4, and 6.",
      "There are 6 equally likely outcomes.",
    ],
    explanation: "3 even faces out of 6, so 3/6 = 1/2.",
    notations: [
      text(2, 44, 1, 2, "A fair six-sided die is rolled. Find P(even)."),
    ],
  },
  {
    id: "general-power-of-two",
    uuid: "a1000006-0000-4000-8000-000000000004",
    subject: "General",
    name: "Evaluate 2⁵",
    difficulty: "intro",
    tags: ["exponents", "arithmetic"],
    expectedAnswer: "32",
    acceptedAnswers: ["2^5 = 32"],
    prompt: "Evaluate 2⁵\nEvaluate:\n2^5",
    hints: [
      "2⁵ means five factors of 2 multiplied together.",
      "2 × 2 × 2 × 2 × 2.",
    ],
    explanation: "2⁵ = 32.",
    notations: [
      text(2, 24, 1, 2, "Evaluate:"),
      sym(2, 5, "2"),
      exp(3, 5, "5"),
    ],
  },
  {
    id: "general-percent-of",
    uuid: "a1000006-0000-4000-8000-000000000005",
    subject: "General",
    name: "15% of 80",
    difficulty: "intro",
    tags: ["percent", "arithmetic"],
    expectedAnswer: "12",
    acceptedAnswers: ["12.0", "15% of 80 = 12"],
    prompt: "15% of 80\nWhat is 15% of 80?",
    hints: [
      "Percent means hundredths: 15% = 15/100.",
      "You can also take 10% of 80 and half of that, then add.",
    ],
    explanation: "0.15 × 80 = 12.",
    notations: [
      text(2, 28, 1, 2, "What is 15% of 80?"),
    ],
  },
  {
    id: "general-ratio-parts",
    uuid: "a1000006-0000-4000-8000-000000000006",
    subject: "General",
    name: "Share in the ratio 3:5",
    difficulty: "core",
    tags: ["ratio", "word-problem"],
    expectedAnswer: "15",
    acceptedAnswers: ["15 dollars", "$15"],
    prompt:
      "Share in the ratio 3:5\n$40 is shared in the ratio 3:5. How much is the smaller share?",
    hints: [
      "The ratio 3:5 has 3 + 5 = 8 parts.",
      "The smaller share is 3 of those 8 parts.",
    ],
    explanation: "Each part is 40/8 = 5, so 3 parts is 15.",
    notations: [
      text(2, 44, 1, 2, "$40 is shared in the ratio 3:5. How much is the smaller share?"),
    ],
  },
  {
    id: "vectors-add-components",
    uuid: "a1000007-0000-4000-8000-000000000001",
    subject: "Vectors",
    name: "Add ⟨3, 1⟩ + ⟨2, 4⟩",
    difficulty: "intro",
    tags: ["vectors", "components"],
    expectedAnswer: "⟨5, 5⟩",
    acceptedAnswers: [
      "<5, 5>",
      "<5,5>",
      "(5, 5)",
      "(5,5)",
      "5i + 5j",
      "5i+5j",
    ],
    prompt: "Add ⟨3, 1⟩ + ⟨2, 4⟩\nCompute ⟨3, 1⟩ + ⟨2, 4⟩.",
    hints: [
      "Add matching components: x with x, y with y.",
      "The first components are 3 and 2.",
    ],
    explanation: "⟨3 + 2, 1 + 4⟩ = ⟨5, 5⟩.",
    notations: [
      text(2, 32, 1, 2, "Compute ⟨3, 1⟩ + ⟨2, 4⟩."),
      line(10, 22, 16, 18, { arrowRight: true }),
      ann(16, 17, "a"),
      line(16, 18, 22, 12, { arrowRight: true }),
      ann(22, 11, "b"),
      line(10, 22, 22, 12, { arrowRight: true, dashed: true }),
      ann(22, 13, "a+b"),
    ],
  },
  {
    id: "vectors-magnitude-3-4",
    uuid: "a1000007-0000-4000-8000-000000000002",
    subject: "Vectors",
    name: "Magnitude of ⟨3, 4⟩",
    difficulty: "intro",
    tags: ["vectors", "magnitude"],
    expectedAnswer: "5",
    acceptedAnswers: ["||v|| = 5", "|v| = 5", "5 units"],
    prompt: "Magnitude of ⟨3, 4⟩\nFind the magnitude of ⟨3, 4⟩.",
    hints: [
      "Magnitude is √(x² + y²).",
      "This is a 3-4-5 right triangle.",
    ],
    explanation: "√(3² + 4²) = √(9 + 16) = √25 = 5.",
    notations: [
      text(2, 36, 1, 2, "Find the magnitude of ⟨3, 4⟩."),
      line(10, 22, 22, 22),
      line(22, 22, 22, 10, { arrowRight: true }),
      line(10, 22, 22, 10, { arrowRight: true }),
      ann(15, 23, "3"),
      ann(23, 16, "4"),
      ann(14, 14, "⟨3, 4⟩"),
    ],
  },
  {
    id: "vectors-scalar-multiply",
    uuid: "a1000007-0000-4000-8000-000000000003",
    subject: "Vectors",
    name: "Scalar 3⟨2, −1⟩",
    difficulty: "intro",
    tags: ["vectors", "scalar"],
    expectedAnswer: "⟨6, −3⟩",
    acceptedAnswers: ["<6, -3>", "<6,-3>", "(6, -3)", "(6,-3)", "6i - 3j"],
    prompt: "Scalar 3⟨2, −1⟩\nCompute 3⟨2, −1⟩.",
    hints: [
      "Multiply each component by the scalar 3.",
      "The y-component is negative, so it stays negative.",
    ],
    explanation: "⟨3 · 2, 3 · (−1)⟩ = ⟨6, −3⟩.",
    notations: [
      text(2, 28, 1, 2, "Compute 3⟨2, −1⟩."),
    ],
  },
  {
    id: "vectors-dot-product",
    uuid: "a1000007-0000-4000-8000-000000000004",
    subject: "Vectors",
    name: "Dot product ⟨2, 3⟩ · ⟨4, 1⟩",
    difficulty: "core",
    tags: ["vectors", "dot-product"],
    expectedAnswer: "11",
    acceptedAnswers: ["11", "a·b = 11"],
    prompt: "Dot product ⟨2, 3⟩ · ⟨4, 1⟩\nFind ⟨2, 3⟩ · ⟨4, 1⟩.",
    hints: [
      "The dot product is x₁x₂ + y₁y₂.",
      "Multiply matching components, then add.",
    ],
    explanation: "2·4 + 3·1 = 8 + 3 = 11.",
    notations: [
      text(2, 36, 1, 2, "Find ⟨2, 3⟩ · ⟨4, 1⟩."),
    ],
  },
  {
    id: "complex-i-squared",
    uuid: "a1000008-0000-4000-8000-000000000001",
    subject: "Complex",
    name: "The imaginary unit i²",
    difficulty: "intro",
    tags: ["imaginary", "powers-of-i"],
    expectedAnswer: "-1",
    acceptedAnswers: ["i^2 = -1", "i² = −1", "−1"],
    prompt: "The imaginary unit i²\nSimplify i².",
    hints: [
      "i is defined so that i² = −1.",
      "This is the definition of the imaginary unit, not a calculator value.",
    ],
    explanation: "By definition, i² = −1.",
    notations: [
      text(2, 24, 1, 2, "Simplify i²."),
      sym(2, 5, "i"),
      exp(3, 5, "2"),
    ],
  },
  {
    id: "complex-i-cubed",
    uuid: "a1000008-0000-4000-8000-000000000002",
    subject: "Complex",
    name: "Simplify i³",
    difficulty: "core",
    tags: ["imaginary", "powers-of-i"],
    expectedAnswer: "-i",
    acceptedAnswers: ["−i", "i^3 = -i", "-1i"],
    prompt: "Simplify i³\nSimplify i³.",
    hints: [
      "Write i³ as i² · i.",
      "i² is −1, so multiply that by i.",
    ],
    explanation: "i³ = i² · i = (−1) · i = −i.",
    notations: [
      text(2, 24, 1, 2, "Simplify i³."),
      sym(2, 5, "i"),
      exp(3, 5, "3"),
    ],
  },
  {
    id: "complex-add",
    uuid: "a1000008-0000-4000-8000-000000000003",
    subject: "Complex",
    name: "Add (3 + 2i) + (1 − 4i)",
    difficulty: "intro",
    tags: ["complex", "arithmetic"],
    expectedAnswer: "4 − 2i",
    acceptedAnswers: ["4-2i", "4 - 2i", "-2i + 4"],
    prompt: "Add (3 + 2i) + (1 − 4i)\nCompute (3 + 2i) + (1 − 4i).",
    hints: [
      "Add the real parts and the imaginary parts separately.",
      "The real parts are 3 and 1.",
    ],
    explanation: "(3 + 1) + (2 − 4)i = 4 − 2i.",
    notations: [
      text(2, 36, 1, 2, "Compute (3 + 2i) + (1 − 4i)."),
    ],
  },
  {
    id: "complex-modulus",
    uuid: "a1000008-0000-4000-8000-000000000004",
    subject: "Complex",
    name: "Modulus of 3 + 4i",
    difficulty: "core",
    tags: ["complex", "modulus"],
    expectedAnswer: "5",
    acceptedAnswers: ["|z| = 5", "|3+4i| = 5"],
    prompt: "Modulus of 3 + 4i\nFind |3 + 4i|.",
    hints: [
      "The modulus |a + bi| is √(a² + b²).",
      "This is the same 3-4-5 triangle as a vector magnitude.",
    ],
    explanation: "|3 + 4i| = √(9 + 16) = √25 = 5.",
    notations: [
      text(2, 28, 1, 2, "Find |3 + 4i|."),
      line(12, 20, 24, 20),
      line(24, 20, 24, 8),
      line(12, 20, 24, 8),
      ann(17, 21, "3"),
      ann(25, 14, "4"),
      ann(13, 12, "3+4i"),
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

export function practiceTemplateStemParts(
  template: PracticeQuestionTemplate,
): PracticeProblemPart[] | null {
  if (!template.parts || template.parts.length < 2) return null;
  return template.parts.map((part) => ({
    id: String(part.id),
    text: part.text,
  }));
}

export function practiceTemplateAnswers(
  template: PracticeQuestionTemplate,
  activePartId?: string | null,
): { expectedAnswer: string; acceptedAnswers?: string[] } {
  const id = (activePartId ?? "").trim();
  if (id && template.parts && template.parts.length >= 2) {
    const part = template.parts.find((p) => String(p.id) === id);
    if (part) {
      return {
        expectedAnswer: part.expectedAnswer,
        acceptedAnswers: part.acceptedAnswers,
      };
    }
  }
  return {
    expectedAnswer: template.expectedAnswer,
    acceptedAnswers: template.acceptedAnswers,
  };
}

/** Hints for the active task. Multi-part worksheets do not reuse another task's tips. */
export function practiceHintsForPart(
  template: PracticeQuestionTemplate | undefined,
  activePartId?: string | null,
): string[] {
  if (!template) return [];
  const parts = template.parts;
  if (parts && parts.length >= 2) {
    const id = (activePartId ?? "").trim();
    const part = id
      ? parts.find((p) => String(p.id) === id)
      : undefined;
    return part?.hints?.length ? part.hints : [];
  }
  return template.hints ?? [];
}

export function nextHintsRevealed(
  hintCount: number,
  revealedCount: number,
): number {
  if (hintCount <= 0) return 0;
  return Math.min(Math.max(0, revealedCount) + 1, hintCount);
}

export function revealedPracticeHint(
  hints: string[] | undefined,
  revealedCount: number,
): string | null {
  if (!hints?.length || revealedCount <= 0) return null;
  return hints[Math.min(revealedCount, hints.length) - 1] ?? null;
}

function isDiagramPointLabel(value: string): boolean {
  return /^[A-Za-z]{1,3}$/.test(value.trim());
}

/** Figure overlay: lines, curves, circles, annotations, and vertex letters. */
export function isPracticeDiagramStemNotation(item: {
  kind?: string;
  notationType?: string;
  value?: string;
}): boolean {
  const kind = item.kind ?? item.notationType ?? "";
  if (DIAGRAM_STEM_KINDS.has(kind)) return true;
  if (kind === "SYMBOL" && isDiagramPointLabel(String(item.value ?? ""))) {
    return true;
  }
  return false;
}

function isMathSymbolRow(value: string): boolean {
  const t = value.trim();
  if (!t || isDiagramPointLabel(t)) return false;
  return /[\d=+\-×÷*/^()∫]/.test(t);
}

/** Flatten stem text into a problem statement: title, question, givens. */
export function formatPracticeProblemPrompt(
  template: PracticeQuestionTemplate,
): string {
  const authored = template.prompt?.trim();
  if (authored) return authored;

  const seen = new Set<string>();
  const take = (bucket: string[], raw: string) => {
    const line = raw.trim();
    if (!line) return;
    const key = line.replace(/\s+/g, "");
    if (seen.has(key)) return;
    seen.add(key);
    bucket.push(line);
  };

  const title: string[] = [];
  const questions: string[] = [];
  const givens: string[] = [];
  const expressions: string[] = [];
  take(title, template.name);

  const symbolsByRow = new Map<number, Array<{ col: number; text: string }>>();
  for (const item of template.notations) {
    switch (item.kind) {
      case "TEXT":
        take(questions, item.value);
        break;
      case "ANNOTATION":
        if (!isDiagramPointLabel(item.value)) take(givens, item.value);
        break;
      case "SYMBOL":
      case "EXPONENT": {
        const text =
          item.kind === "EXPONENT" ? "^" + item.value : item.value;
        const list = symbolsByRow.get(item.row) ?? [];
        list.push({ col: item.col, text });
        symbolsByRow.set(item.row, list);
        break;
      }
      default:
        break;
    }
  }

  const rows = [...symbolsByRow.keys()].sort((a, b) => a - b);
  for (const row of rows) {
    const cells = (symbolsByRow.get(row) ?? []).sort((a, b) => a.col - b.col);
    const joined = cells.map((c) => c.text).join("");
    if (isMathSymbolRow(joined)) take(expressions, joined);
  }

  const lines = [...title, ...questions, ...expressions];
  if (givens.length) {
    if (questions.length || expressions.length) lines.push("Given:");
    lines.push(...givens);
  }
  return lines.join("\n");
}
