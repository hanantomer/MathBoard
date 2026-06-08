/** Notation payload for cloning a template lesson onto a teacher's board. */
export type LessonTemplateSymbol = {
  kind: "SYMBOL";
  col: number;
  row: number;
  value: string;
};

export type LessonTemplateText = {
  kind: "TEXT";
  fromCol: number;
  toCol: number;
  fromRow: number;
  toRow: number;
  value: string;
};

export type LessonTemplateLine = {
  kind: "LINE";
  p1x: number;
  p1y: number;
  p2x: number;
  p2y: number;
  dashed?: boolean;
  arrowLeft?: boolean;
  arrowRight?: boolean;
};

export type LessonTemplateAnnotation = {
  kind: "ANNOTATION";
  x: number;
  y: number;
  value: string;
};

export type LessonTemplateCurve = {
  kind: "CURVE";
  p1x: number;
  p1y: number;
  p2x: number;
  p2y: number;
  cpx: number;
  cpy: number;
};

export type LessonTemplateSqrt = {
  kind: "SQRT";
  fromCol: number;
  toCol: number;
  row: number;
};

export type LessonTemplateExponent = {
  kind: "EXPONENT";
  col: number;
  row: number;
  value: string;
};

export type LessonTemplateNotation =
  | LessonTemplateSymbol
  | LessonTemplateText
  | LessonTemplateLine
  | LessonTemplateAnnotation
  | LessonTemplateCurve
  | LessonTemplateSqrt
  | LessonTemplateExponent;

export type LessonTemplate = {
  id: string;
  name: string;
  description: string;
  notations: LessonTemplateNotation[];
};

function sym(col: number, row: number, value: string): LessonTemplateSymbol {
  return { kind: "SYMBOL", col, row, value };
}

function text(
  fromCol: number,
  toCol: number,
  fromRow: number,
  toRow: number,
  value: string,
): LessonTemplateText {
  return { kind: "TEXT", fromCol, toCol, fromRow, toRow, value };
}

/** Grid cell → SVG pixel coords (1650×1650 board, 100×50 cells). */
function px(col: number, row: number): { x: number; y: number } {
  return { x: Math.round(col * 16.5), y: Math.round(row * 33) };
}

function line(
  c1: number,
  r1: number,
  c2: number,
  r2: number,
  opts?: Partial<Pick<LessonTemplateLine, "dashed" | "arrowLeft" | "arrowRight">>,
): LessonTemplateLine {
  const a = px(c1, r1);
  const b = px(c2, r2);
  return {
    kind: "LINE",
    p1x: a.x,
    p1y: a.y,
    p2x: b.x,
    p2y: b.y,
    dashed: opts?.dashed ?? false,
    arrowLeft: opts?.arrowLeft ?? false,
    arrowRight: opts?.arrowRight ?? false,
  };
}

function ann(col: number, row: number, value: string): LessonTemplateAnnotation {
  const p = px(col, row);
  return { kind: "ANNOTATION", x: p.x, y: p.y, value };
}

/** Math (x right, y up) → board pixels; origin at (originCol, originRow). */
function graphPx(
  x: number,
  y: number,
  originCol: number,
  originRow: number,
  xScale = 2,
  yScale = 3,
): { x: number; y: number } {
  return px(originCol + x * xScale, originRow - y * yScale);
}

function curve(
  x1: number,
  y1: number,
  cx: number,
  cy: number,
  x2: number,
  y2: number,
  originCol: number,
  originRow: number,
): LessonTemplateCurve {
  const p1 = graphPx(x1, y1, originCol, originRow);
  const cp = graphPx(cx, cy, originCol, originRow);
  const p2 = graphPx(x2, y2, originCol, originRow);
  return {
    kind: "CURVE",
    p1x: p1.x,
    p1y: p1.y,
    p2x: p2.x,
    p2y: p2.y,
    cpx: cp.x,
    cpy: cp.y,
  };
}

function sqrt(
  fromCol: number,
  toCol: number,
  row: number,
): LessonTemplateSqrt {
  return { kind: "SQRT", fromCol, toCol, row };
}

function exp(col: number, row: number, value: string): LessonTemplateExponent {
  return { kind: "EXPONENT", col, row, value };
}

/** Shipped sample lessons — cloned into the signed-in teacher's account. */
export const LESSON_TEMPLATES: LessonTemplate[] = [
  {
    id: "intro-linear-equations",
    name: "Sample: Linear equations",
    description:
      "Worked example solving 2x + 5 = 13. Use as a demo or starting point for your class.",
    notations: [
      text(2, 38, 1, 2, "Sample: Solve for x"),
      sym(2, 5, "2"),
      sym(3, 5, "x"),
      sym(4, 5, "+"),
      sym(5, 5, "5"),
      sym(6, 5, "="),
      sym(7, 5, "1"),
      sym(8, 5, "3"),
      text(2, 30, 6, 6, "Subtract 5 from both sides:"),
      sym(2, 8, "2"),
      sym(3, 8, "x"),
      sym(4, 8, "="),
      sym(5, 8, "8"),
      text(2, 24, 9, 9, "Divide both sides by 2:"),
      sym(2, 11, "x"),
      sym(3, 11, "="),
      sym(4, 11, "4"),
    ],
  },
  {
    id: "intro-pythagorean-theorem",
    name: "Sample: Pythagorean theorem",
    description:
      "3-4-5 triangle with annotated dimensions; worked solution in symbols to the right.",
    notations: [
      text(2, 40, 1, 2, "Sample: Pythagorean theorem (3-4-5 triangle)"),
      // Right angle at C; legs CB (horizontal) and CA (vertical); hypotenuse AB
      line(8, 22, 32, 22),
      line(8, 22, 8, 8),
      line(8, 8, 32, 22),
      sym(6, 22, "C"),
      sym(33, 22, "B"),
      sym(6, 7, "A"),
      ann(9, 22, "90°"),
      ann(6, 15, "a=3"),
      ann(19, 23, "b=4"),
      ann(21, 14, "c=5"),
      // Worked solution to the right of the triangle
      text(38, 52, 10, 10, "Theorem:"),
      sym(38, 12, "a"),
      exp(38, 12, "2"),
      sym(39, 12, "+"),
      sym(40, 12, "b"),
      exp(40, 12, "2"),
      sym(41, 12, "="),
      sym(42, 12, "c"),
      exp(42, 12, "2"),
      text(38, 52, 14, 14, "Substitute:"),
      sym(38, 16, "3"),
      exp(38, 16, "2"),
      sym(39, 16, "+"),
      sym(40, 16, "4"),
      exp(40, 16, "2"),
      sym(41, 16, "="),
      sym(42, 16, "5"),
      exp(42, 16, "2"),
      text(38, 52, 18, 18, "Expand:"),
      sym(38, 20, "9"),
      sym(39, 20, "+"),
      sym(40, 20, "1"),
      sym(41, 20, "6"),
      sym(42, 20, "="),
      sym(43, 20, "2"),
      sym(44, 20, "5"),
      text(38, 52, 22, 22, "So c ="),
      sym(43, 24, "5"),
    ],
  },
  {
    id: "intro-trigonometry",
    name: "Sample: Trigonometry",
    description:
      "3-4-5 right triangle with annotated sides and angle θ; SOH CAH TOA ratios to the right.",
    notations: [
      text(2, 40, 1, 2, "Sample: Trigonometry (SOH CAH TOA)"),
      // Right angle at C; θ at B; legs CB (adj) and CA (opp); hypotenuse AB
      line(8, 22, 32, 22),
      line(8, 22, 8, 8),
      line(8, 8, 32, 22),
      sym(6, 22, "C"),
      sym(33, 22, "B"),
      sym(6, 7, "A"),
      ann(9, 22, "90°"),
      ann(31, 20, "θ"),
      ann(6, 15, "opp=3"),
      ann(19, 23, "adj=4"),
      ann(21, 14, "hyp=5"),
      text(38, 52, 8, 9, "For angle θ at B:"),
      text(38, 52, 12, 13, "sin θ = opp/hyp = 3/5"),
      text(38, 52, 16, 17, "cos θ = adj/hyp = 4/5"),
      text(38, 52, 20, 21, "tan θ = opp/adj = 3/4"),
    ],
  },
  {
    id: "intro-sqrt-polynomial-inquiry",
    name: "Sample: Square root inquiry",
    description:
      "Graph of y = √x with inquiry questions; polynomial y = x²/4 for comparison.",
    notations: [
      text(2, 42, 1, 2, "Sample: Square root & polynomial inquiry"),
      // Axes (origin col 8, row 38)
      line(8, 38, 36, 38, { arrowRight: true }),
      line(8, 38, 8, 16, { arrowRight: false }),
      ann(36, 38, "x"),
      ann(7, 16, "y"),
      ann(7, 38, "O"),
      // y = √x (three quadratic-bezier segments)
      curve(0, 0, 0.6, 0.85, 1, 1, 8, 38),
      curve(1, 1, 2.5, 1.55, 4, 2, 8, 38),
      curve(4, 2, 6.5, 2.55, 9, 3, 8, 38),
      // y = x²/4 (polynomial comparison, curves)
      curve(0, 0, 1, 0.2, 2, 1, 8, 38),
      curve(2, 1, 3, 2.2, 4, 4, 8, 38),
      ann(27, 19, "y=x²/4"),
      ann(27, 28, "y=√x"),
      ann(10, 35, "(1,1)"),
      ann(16, 32, "(4,2)"),
      ann(9, 38, "x≥0"),
      sym(2, 4, "y"),
      sym(3, 4, "="),
      sqrt(4, 6, 4),
      sym(5, 4, "x"),
      text(38, 52, 4, 5, "Inquiry questions"),
      text(38, 52, 7, 8, "1. What is the domain of y = √x?"),
      text(38, 50, 10, 10, "2. Estimate"),
      sqrt(38, 40, 10),
      sym(39, 10, "5"),
      text(41, 52, 10, 10, "from the graph."),
      text(38, 52, 13, 14, "3. For x = 4, compare √x and x²/4."),
      text(38, 52, 16, 17, "4. Where does √x grow faster: near 0 or near 9?"),
      text(38, 52, 19, 20, "5. Why is the polynomial curve steeper at x = 4?"),
    ],
  },
];

export function getLessonTemplate(id: string): LessonTemplate | undefined {
  return LESSON_TEMPLATES.find((t) => t.id === id);
}
