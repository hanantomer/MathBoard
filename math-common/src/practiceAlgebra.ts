import {
  parsePracticeProblemParts,
  stripPracticeTutorMarkup,
  workForActivePartReview,
} from "./practiceParts";

/** Quadratic ax^2 + bx + c. */
export type QuadraticCoeffs = { a: number; b: number; c: number };

const EPS = 1e-9;

export function normalizeAlgebra(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3");
}

/**
 * Board stacked fractions serialize as (num)/(den). Unwrap monomials so
 * (x^2)/(2)+C matches the catalog form x^2/2+C.
 */
export function unwrapBoardFractions(text: string): string {
  const monomial =
    "[+-]?(?:\\d+(?:\\.\\d+)?(?:[a-z](?:\\^\\d+)*)*|[a-z](?:\\^\\d+)*(?:[a-z](?:\\^\\d+)*)*)";
  return text
    .replace(
      new RegExp(`\\((${monomial})\\)\\/\\((${monomial})\\)`, "g"),
      "$1/$2",
    )
    .replace(/\((\d+(?:\.\d+)?\/\d+(?:\.\d+)?)\)(?!\^)/g, "$1");
}

/** Normalize student work / catalog answers for equality checks. */
export function normalizePracticeMatch(text: string): string {
  return unwrapBoardFractions(
    normalizeAlgebra(stripPracticeTutorMarkup(text ?? "")),
  );
}

function coeffsEqual(p: QuadraticCoeffs, q: QuadraticCoeffs): boolean {
  return (
    Math.abs(p.a - q.a) < EPS &&
    Math.abs(p.b - q.b) < EPS &&
    Math.abs(p.c - q.c) < EPS
  );
}

function parseSignedNumber(raw: string, emptyValue: number): number | null {
  if (raw === "" || raw === "+") return emptyValue;
  if (raw === "-") return -emptyValue;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** a(x-h)^2+k  →  ax^2 - 2ah x + (ah^2+k) */
export function parseVertexQuadratic(expr: string): QuadraticCoeffs | null {
  const s = normalizeAlgebra(expr).replace(/^\+/, "");
  const m = s.match(
    /^([+-]?(?:\d*\.?\d+)?)?\*?\(x([+-]\d+(?:\.\d+)?)\)\^2([+-]\d+(?:\.\d+)?)?$/,
  );
  if (!m) return null;
  const a = parseSignedNumber(m[1] ?? "", 1);
  const inner = Number(m[2]);
  const k = m[3] == null || m[3] === "" ? 0 : Number(m[3]);
  if (a == null || a === 0 || !Number.isFinite(inner) || !Number.isFinite(k)) {
    return null;
  }
  const h = -inner;
  return { a, b: -2 * a * h, c: a * h * h + k };
}

function parseStandardQuadratic(expr: string): QuadraticCoeffs | null {
  const s = normalizeAlgebra(expr).replace(/^\+/, "");
  if (!s.includes("x^2")) return null;
  const terms = s.match(/[+-]?[^+-]+/g);
  if (!terms || terms.length === 0 || terms.length > 3) return null;

  let a = 0;
  let b = 0;
  let c = 0;
  let sawA = false;
  for (const term of terms) {
    const sign = term.startsWith("-") ? -1 : 1;
    const body = term.replace(/^[+-]/, "");
    if (body.endsWith("x^2")) {
      const coeff = parseSignedNumber(body.slice(0, -3), 1);
      if (coeff == null || sawA) return null;
      a = sign * coeff;
      sawA = true;
      continue;
    }
    if (body.endsWith("x") && !body.includes("^")) {
      const coeff = parseSignedNumber(body.slice(0, -1), 1);
      if (coeff == null) return null;
      b += sign * coeff;
      continue;
    }
    const n = Number(body);
    if (!Number.isFinite(n) || body === "") return null;
    c += sign * n;
  }
  if (!sawA) return null;
  return { a, b, c };
}

function addPoly(p: QuadraticCoeffs, q: QuadraticCoeffs): QuadraticCoeffs {
  return { a: p.a + q.a, b: p.b + q.b, c: p.c + q.c };
}

function scalePoly(p: QuadraticCoeffs, k: number): QuadraticCoeffs {
  return { a: p.a * k, b: p.b * k, c: p.c * k };
}

function mulPoly(
  p: QuadraticCoeffs,
  q: QuadraticCoeffs,
): QuadraticCoeffs | null {
  if (
    (p.a !== 0 && (q.a !== 0 || q.b !== 0)) ||
    (q.a !== 0 && (p.a !== 0 || p.b !== 0))
  ) {
    return null;
  }
  return {
    a: p.a * q.c + p.b * q.b + p.c * q.a,
    b: p.b * q.c + p.c * q.b,
    c: p.c * q.c,
  };
}

function powPoly(p: QuadraticCoeffs, exp: number): QuadraticCoeffs | null {
  if (exp === 1) return p;
  if (exp === 2) return mulPoly(p, p);
  return null;
}

/**
 * Expand a quadratic (parentheses, distribution, (x-h)^2).
 * Covers completing-the-square lines such as 2(x^2-4x+4)-8+5.
 */
export function parseQuadraticExpr(expr: string): QuadraticCoeffs | null {
  const s = normalizeAlgebra(expr).replace(/^\+/, "");
  if (!s) return null;
  let i = 0;

  const peek = () => s[i] ?? "";
  const eat = () => s[i++] ?? "";

  const parseNumber = (): number | null => {
    const m = s.slice(i).match(/^\d+(?:\.\d+)?/);
    if (!m) return null;
    i += m[0].length;
    return Number(m[0]);
  };

  const parseAtom = (): QuadraticCoeffs | null => {
    if (peek() === "(") {
      eat();
      const inner = parseExpr();
      if (!inner || peek() !== ")") return null;
      eat();
      return inner;
    }
    if (peek() === "x") {
      eat();
      return { a: 0, b: 1, c: 0 };
    }
    const n = parseNumber();
    if (n == null) return null;
    return { a: 0, b: 0, c: n };
  };

  const parsePower = (): QuadraticCoeffs | null => {
    let base = parseAtom();
    if (!base) return null;
    if (peek() === "^") {
      eat();
      const exp = parseNumber();
      if (exp == null) return null;
      base = powPoly(base, exp);
    }
    return base;
  };

  const parseUnary = (): QuadraticCoeffs | null => {
    if (peek() === "+") {
      eat();
      return parseUnary();
    }
    if (peek() === "-") {
      eat();
      const p = parseUnary();
      return p ? scalePoly(p, -1) : null;
    }
    return parsePower();
  };

  const parseTerm = (): QuadraticCoeffs | null => {
    let left = parseUnary();
    if (!left) return null;
    while (true) {
      if (peek() === "*") {
        eat();
        const right = parseUnary();
        if (!right) return null;
        left = mulPoly(left, right);
        if (!left) return null;
        continue;
      }
      const c = peek();
      if (c === "x" || c === "(" || /\d/.test(c)) {
        const right = parseUnary();
        if (!right) return null;
        left = mulPoly(left, right);
        if (!left) return null;
        continue;
      }
      break;
    }
    return left;
  };

  const parseExpr = (): QuadraticCoeffs | null => {
    let left = parseTerm();
    if (!left) return null;
    while (peek() === "+" || peek() === "-") {
      const op = eat();
      const right = parseTerm();
      if (!right) return null;
      left = op === "+" ? addPoly(left, right) : addPoly(left, scalePoly(right, -1));
    }
    return left;
  };

  const result = parseExpr();
  if (!result || i !== s.length || Math.abs(result.a) < EPS) return null;
  return result;
}

function rhsExpressions(text: string): string[] {
  const out: string[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = normalizeAlgebra(stripPracticeTutorMarkup(rawLine));
    if (!line) continue;
    const eq = line.lastIndexOf("=");
    out.push(eq >= 0 ? line.slice(eq + 1) : line);
  }
  return out;
}

function parseAnyQuadratic(expr: string): QuadraticCoeffs | null {
  return (
    parseStandardQuadratic(expr) ??
    parseVertexQuadratic(expr) ??
    parseQuadraticExpr(expr)
  );
}

export function firstStandardQuadratic(text: string): QuadraticCoeffs | null {
  for (const expr of rhsExpressions(text)) {
    const q = parseAnyQuadratic(expr);
    if (q) return q;
  }
  return null;
}

export function lastVertexQuadratic(text: string): QuadraticCoeffs | null {
  const exprs = rhsExpressions(text);
  for (let i = exprs.length - 1; i >= 0; i--) {
    const q = parseVertexQuadratic(exprs[i]);
    if (q) return q;
  }
  return null;
}

function prettyExpr(expr: string): string {
  return expr.replace(/\^2/g, "²");
}

function prettyShift(h: number): string {
  if (Math.abs(h) < EPS) return "(x)";
  return h > 0 ? `(x-${h})` : `(x+${-h})`;
}

/** Leading a(x-h)^2 even when extra terms follow, e.g. 2(x-4)^2-8+5. */
function leadingVertexShift(expr: string): { h: number } | null {
  const s = normalizeAlgebra(expr).replace(/^\+/, "");
  const m = s.match(/^([+-]?(?:\d*\.?\d+)?)?\*?\(x([+-]\d+(?:\.\d+)?)\)\^2/);
  if (!m) return null;
  const inner = Number(m[2]);
  if (!Number.isFinite(inner)) return null;
  return { h: -inner };
}

function looksLikeQuadraticRewrite(expr: string): boolean {
  const s = normalizeAlgebra(expr);
  return s.includes("x^2") || /\(x[+-]/.test(s);
}

export type VertexRewriteReview = {
  /** Latest line is vertex form (strict or with leftover constants) and matches. */
  equivalent: boolean;
  /** Equivalent and k is a single number, e.g. 2(x-2)^2-3 not 2(x-2)^2-8+5. */
  simplified: boolean;
  /**
   * Last line is a grouped rewrite (completing the square, factoring a, etc.)
   * that still expands to the original — not yet necessarily vertex form.
   */
  rewriteMatches: boolean;
  /** Set when the last line is right but earlier rewrite lines slipped. */
  warning: string | null;
};

const EMPTY_REVIEW: VertexRewriteReview = {
  equivalent: false,
  simplified: false,
  rewriteMatches: false,
  warning: null,
};

/** Next-step tip when vertex form still has leftover constants like -8+5. */
export const SIMPLIFY_VERTEX_CONSTANTS_TIP =
  "Combine the constants outside the square into one number.";

/** Next-step tip when they found y but not the intercept as a point. */
export const Y_INTERCEPT_AS_POINT_TIP =
  "Write the y-intercept as a point (0, …), not only y =.";

function lastQuadraticLine(
  text: string,
): { expr: string; coeffs: QuadraticCoeffs } | null {
  const exprs = rhsExpressions(text);
  for (let i = exprs.length - 1; i >= 0; i--) {
    const q = parseAnyQuadratic(exprs[i]);
    if (q) return { expr: exprs[i], coeffs: q };
  }
  return null;
}

function isSimplifiedVertexExpr(
  expr: string,
  original: QuadraticCoeffs,
): boolean {
  const strict = parseVertexQuadratic(expr);
  return !!(strict && coeffsEqual(strict, original));
}

function isVertexFormExpr(
  expr: string,
  original: QuadraticCoeffs,
): boolean {
  const strict = parseVertexQuadratic(expr);
  if (strict && coeffsEqual(strict, original)) return true;
  const shift = leadingVertexShift(expr);
  const expanded = parseQuadraticExpr(expr);
  if (!shift || !expanded || !coeffsEqual(expanded, original)) return false;
  const correctH = -original.b / (2 * original.a);
  return Number.isFinite(correctH) && Math.abs(shift.h - correctH) < EPS;
}

function earlierRewriteNotes(
  work: string,
  original: QuadraticCoeffs,
): string[] {
  const correctH = -original.b / (2 * original.a);
  const notes: string[] = [];
  for (const expr of rhsExpressions(work)) {
    const expanded = parseAnyQuadratic(expr);
    if (expanded && coeffsEqual(expanded, original)) continue;
    if (!looksLikeQuadraticRewrite(expr)) continue;

    const shift = leadingVertexShift(expr);
    if (
      shift &&
      Number.isFinite(correctH) &&
      Math.abs(shift.h - correctH) > EPS
    ) {
      notes.push(
        `${prettyExpr(expr)} used ${prettyShift(shift.h)} instead of ${prettyShift(correctH)}`,
      );
    } else {
      notes.push(`${prettyExpr(expr)} doesn't expand to the original`);
    }
    if (notes.length >= 2) break;
  }
  return notes;
}

/**
 * Latest quadratic rewrite vs the given function. `equivalent` means a matching
 * binomial square (including leftover constants like -8+5). `simplified` means
 * a single k, e.g. 2(x-2)^2-3. `rewriteMatches` is a grouped rewrite that
 * still expands to the original — not yet necessarily vertex form.
 */
export function reviewVertexRewrite(
  problemText: string | undefined,
  studentWork: string,
): VertexRewriteReview {
  const work = (studentWork ?? "").trim();
  if (!work) return EMPTY_REVIEW;

  const original =
    firstStandardQuadratic(problemText ?? "") ?? firstStandardQuadratic(work);
  if (!original) return EMPTY_REVIEW;

  const lastVertexExpr = (() => {
    const exprs = rhsExpressions(work);
    for (let i = exprs.length - 1; i >= 0; i--) {
      if (isVertexFormExpr(exprs[i], original)) return exprs[i];
    }
    return null;
  })();
  const last = lastQuadraticLine(work);

  if (lastVertexExpr) {
    const notes = earlierRewriteNotes(work, original);
    const simplified = isSimplifiedVertexExpr(lastVertexExpr, original);
    return {
      equivalent: true,
      simplified,
      rewriteMatches: true,
      warning:
        notes.length > 0
          ? `Earlier steps don't follow: ${notes.join("; ")}.`
          : null,
    };
  }

  if (!last || !coeffsEqual(original, last.coeffs)) {
    return EMPTY_REVIEW;
  }
  return {
    equivalent: false,
    simplified: false,
    rewriteMatches: last.expr.includes("("),
    warning: null,
  };
}

/**
 * True when the latest vertex form on the board expands to the given quadratic
 * (from the problem, or from the student's first standard-form line).
 */
export function workHasEquivalentVertexForm(
  problemText: string | undefined,
  studentWork: string,
): boolean {
  return reviewVertexRewrite(problemText, studentWork).equivalent;
}

export function vertexOfQuadratic(q: QuadraticCoeffs): { h: number; k: number } {
  const h = -q.b / (2 * q.a);
  const k = q.c - q.a * h * h;
  return { h, k };
}

export type QuadraticPartKind =
  | "vertexForm"
  | "vertexCoordinates"
  | "axis"
  | "yIntercept"
  | "graph"
  | "maxMin"
  | "other";

export function quadraticPartKind(
  partText: string | undefined,
): QuadraticPartKind {
  const t = (partText ?? "").toLowerCase();
  if (!t.trim()) return "other";
  if (/vertex form|completing the square|complete the square/.test(t)) {
    return "vertexForm";
  }
  if (/y-?intercept/.test(t)) return "yIntercept";
  if (/axis/.test(t)) return "axis";
  if (/sketch|graph|parabola/.test(t)) return "graph";
  if (/maximum|minimum/.test(t)) return "maxMin";
  if (/coordinate|\bvertex\b/.test(t)) return "vertexCoordinates";
  return "other";
}

function kindForActivePart(
  problemText: string | undefined,
  activePartId?: string | null,
): QuadraticPartKind {
  const parts = parsePracticeProblemParts(problemText);
  if (parts.length === 0) return "other";
  const id = (activePartId ?? "").trim().toLowerCase();
  const part =
    (id && parts.find((p) => p.id.toLowerCase() === id)) || parts[0];
  return quadraticPartKind(part?.text);
}

function originalQuadratic(
  problemText: string | undefined,
  studentWork?: string,
): QuadraticCoeffs | null {
  return (
    firstStandardQuadratic(problemText ?? "") ??
    firstStandardQuadratic(studentWork ?? "")
  );
}

function namedNumber(text: string, letter: string): number | null {
  const s = normalizeAlgebra(text);
  const re = new RegExp(`(?:^|[^a-z])${letter}=([+-]?\\d+(?:\\.\\d+)?)`);
  const m = s.match(re);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

/**
 * Last `y=5` / `x=0` that is a finished assignment, not the start of
 * `y=2(0^2-4*0)+5`.
 */
function lastStandaloneNumber(text: string, letter: string): number | null {
  const s = normalizeAlgebra(stripPracticeTutorMarkup(text));
  const re = new RegExp(
    `(?:^|[^a-z])${letter}=([+-]?\\d+(?:\\.\\d+)?)(?![0-9.(*/^x])`,
    "g",
  );
  let last: number | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const n = Number(m[1]);
    if (Number.isFinite(n)) last = n;
  }
  return last;
}

function coordinatePairs(text: string): Array<{ x: number; y: number }> {
  const s = normalizeAlgebra(text);
  const out: Array<{ x: number; y: number }> = [];
  const re = /[\(\[]([+-]?\d+(?:\.\d+)?),([+-]?\d+(?:\.\d+)?)[\)\]]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const x = Number(m[1]);
    const y = Number(m[2]);
    if (Number.isFinite(x) && Number.isFinite(y)) out.push({ x, y });
  }
  return out;
}

function workStatesPoint(text: string, x: number, y: number): boolean {
  if (
    coordinatePairs(text).some(
      (p) => Math.abs(p.x - x) < EPS && Math.abs(p.y - y) < EPS,
    )
  ) {
    return true;
  }
  const h = namedNumber(text, "h");
  const k = namedNumber(text, "k");
  if (
    h != null &&
    k != null &&
    Math.abs(h - x) < EPS &&
    Math.abs(k - y) < EPS
  ) {
    return true;
  }
  const xv = namedNumber(text, "x");
  const yv = namedNumber(text, "y");
  return (
    xv != null &&
    yv != null &&
    Math.abs(xv - x) < EPS &&
    Math.abs(yv - y) < EPS
  );
}

export function workHasVertexCoordinates(
  problemText: string | undefined,
  studentWork: string,
): boolean {
  const q = originalQuadratic(problemText, studentWork);
  if (!q) return false;
  const v = vertexOfQuadratic(q);
  return workStatesPoint(studentWork, v.h, v.k);
}

export function workHasAxisOfSymmetry(
  problemText: string | undefined,
  studentWork: string,
): boolean {
  const q = originalQuadratic(problemText, studentWork);
  if (!q) return false;
  const { h } = vertexOfQuadratic(q);
  const x = namedNumber(studentWork, "x");
  return x != null && Math.abs(x - h) < EPS;
}

export function workHasYIntercept(
  problemText: string | undefined,
  studentWork: string,
): boolean {
  const q = originalQuadratic(problemText, studentWork);
  if (!q) return false;
  if (workStatesPoint(studentWork, 0, q.c)) return true;
  const f0 = studentWork.match(/f\s*\(\s*0\s*\)\s*=\s*([+-]?\d+(?:\.\d+)?)/i);
  if (f0 && Math.abs(Number(f0[1]) - q.c) < EPS) return true;
  const x = lastStandaloneNumber(studentWork, "x");
  const y = lastStandaloneNumber(studentWork, "y");
  return (
    x != null &&
    Math.abs(x) < EPS &&
    y != null &&
    Math.abs(y - q.c) < EPS
  );
}

/** True when they evaluated f(0) to y=c but did not state the point (0, c). */
export function workHasYInterceptValueOnly(
  problemText: string | undefined,
  studentWork: string,
): boolean {
  if (workHasYIntercept(problemText, studentWork)) return false;
  const q = originalQuadratic(problemText, studentWork);
  if (!q) return false;
  const y = lastStandaloneNumber(studentWork, "y");
  return y != null && Math.abs(y - q.c) < EPS;
}

export function yInterceptCoachOverride(
  problemText: string | undefined,
  studentWork: string,
): { speak: boolean; tip: string } | null {
  if (workHasYIntercept(problemText, studentWork)) {
    return { speak: false, tip: "" };
  }
  if (workHasYInterceptValueOnly(problemText, studentWork)) {
    return { speak: true, tip: Y_INTERCEPT_AS_POINT_TIP };
  }
  return null;
}

export function workHasMaxOrMin(
  problemText: string | undefined,
  studentWork: string,
): boolean {
  const q = originalQuadratic(problemText, studentWork);
  if (!q) return false;
  const t = studentWork.toLowerCase();
  if (q.a > 0) {
    return /minimum|\bmin\b|opens up/.test(t) && !/maximum|\bmax\b/.test(t);
  }
  return /maximum|\bmax\b|opens down/.test(t) && !/minimum|\bmin\b/.test(t);
}

const GRAPH_VERTEX_TOL = 1.5;

export function parseConicDiagramLines(studentWork: string): Array<{
  kind: string;
  h?: number;
  k?: number;
  opens?: string;
}> {
  const out: Array<{
    kind: string;
    h?: number;
    k?: number;
    opens?: string;
  }> = [];
  const re =
    /diagram:\s*(parabola|hyperbola)(?:\s+vertex≈\(([+-]?\d+(?:\.\d+)?),([+-]?\d+(?:\.\d+)?)\))?(?:\s+opens=([a-z-]+))?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(studentWork))) {
    const h = m[2] != null ? Number(m[2]) : undefined;
    const k = m[3] != null ? Number(m[3]) : undefined;
    out.push({
      kind: m[1].toLowerCase(),
      h: h != null && Number.isFinite(h) ? h : undefined,
      k: k != null && Number.isFinite(k) ? k : undefined,
      opens: m[4]?.toLowerCase(),
    });
  }
  return out;
}

/** Lenient sketch check: opening matches sign of a, vertex near (h,k) when given. */
export function workHasParabolaGraph(
  problemText: string | undefined,
  studentWork: string,
): boolean {
  const q = originalQuadratic(problemText, studentWork);
  if (!q) return false;
  const v = vertexOfQuadratic(q);
  const expectUp = q.a > 0;
  return parseConicDiagramLines(studentWork).some((d) => {
    if (d.kind !== "parabola") return false;
    if (d.opens === "up" && !expectUp) return false;
    if (d.opens === "down" && expectUp) return false;
    if (d.h == null || d.k == null) {
      return d.opens === "up" || d.opens === "down";
    }
    return (
      Math.abs(d.h - v.h) <= GRAPH_VERTEX_TOL &&
      Math.abs(d.k - v.k) <= GRAPH_VERTEX_TOL
    );
  });
}

export function checkQuadraticFollowUpPart(
  problemText: string | undefined,
  studentWork: string,
  partText: string | undefined,
): { correct: true; feedback: string } | null {
  const kind = quadraticPartKind(partText);
  if (
    kind === "vertexCoordinates" &&
    workHasVertexCoordinates(problemText, studentWork)
  ) {
    return {
      correct: true,
      feedback: "Correct — those are the coordinates of the vertex.",
    };
  }
  if (kind === "axis" && workHasAxisOfSymmetry(problemText, studentWork)) {
    return {
      correct: true,
      feedback: "Correct — that is the axis of symmetry.",
    };
  }
  if (kind === "yIntercept" && workHasYIntercept(problemText, studentWork)) {
    return {
      correct: true,
      feedback: "Correct — that is the y-intercept.",
    };
  }
  if (kind === "maxMin" && workHasMaxOrMin(problemText, studentWork)) {
    return {
      correct: true,
      feedback: "Correct — that names the extreme value.",
    };
  }
  if (kind === "graph" && workHasParabolaGraph(problemText, studentWork)) {
    return {
      correct: true,
      feedback: "Correct — that sketch matches the parabola.",
    };
  }
  return null;
}

/** True when the latest student line is the catalog answer (not an earlier step). */
export function workMatchesExpectedAnswer(
  studentWork: string,
  expectedAnswer: string,
  acceptedAnswers: string[] = [],
): boolean {
  const last = lastStudentMathLine(studentWork);
  if (!last) return false;
  const candidates = [expectedAnswer, ...acceptedAnswers]
    .map(normalizePracticeMatch)
    .filter(Boolean);
  if (candidates.includes(last)) return true;
  const rhs = last.includes("=") ? last.slice(last.lastIndexOf("=") + 1) : last;
  if (!rhs) return false;
  if (candidates.includes(rhs)) return true;
  return candidates.some((answer) => {
    if (!answer.includes("=")) return false;
    return answer.slice(answer.lastIndexOf("=") + 1) === rhs;
  });
}

/** True when +C (constant of integration) is already in the work. */
export function workHasIntegrationConstant(studentWork: string): boolean {
  const n = normalizePracticeMatch(studentWork);
  if (/(?:^|[^a-z])(?:\+|plus)c(?:$|[^a-z])/.test(n)) return true;
  const hasC = /(?:^|[^a-z])c(?:$|[^a-z])/.test(n);
  return hasC && (/[∫]/.test(n) || (/x\^2/.test(n) && /\//.test(n)));
}

/** Live coach often nags to “put C on the same line” after C is already written. */
export function coachNagsAboutPresentIntegrationConstant(
  tip: string,
  studentWork: string,
): boolean {
  if (!workHasIntegrationConstant(studentWork)) return false;
  const t = tip.toLowerCase();
  return (
    /constant of integration/.test(t) ||
    /same line as the integral/.test(t) ||
    (/\bon the same line\b/.test(t) &&
      /\b(integral|constant|\+\s*c)\b/.test(t)) ||
    /write (?:the )?(?:constant|\+\s*c)\b/.test(t) ||
    /add (?:the )?(?:constant|\+\s*c)\b/.test(t) ||
    /don'?t forget.{0,24}(?:constant|\+\s*c)/.test(t) ||
    /remember to.{0,24}(?:constant|\+\s*c)/.test(t)
  );
}

function isIgnorableStudentWorkLine(line: string): boolean {
  if (!line) return true;
  if (/^\[Part\s/i.test(line)) return true;
  if (/^unlabeled:/i.test(line)) return true;
  if (/\(none yet for part /i.test(line)) return true;
  if (/^diagram:/i.test(line)) return true;
  if (/^sides:/i.test(line)) return true;
  if (/^vertices:/i.test(line)) return true;
  if (/^angles:/i.test(line)) return true;
  if (/^[A-Za-z]{1,3}$/.test(line)) return true;
  return false;
}

const INTEGRATION_CONSTANT_LINE = /^(?:\+|plus)?c$/;

function joinPlus(base: string, suffix: string): string {
  if (!suffix) return base;
  if (!base) return suffix;
  if (base.endsWith("+") && suffix.startsWith("+")) {
    return base + suffix.slice(1);
  }
  if (!/[+\-*/=]$/.test(base) && !suffix.startsWith("+")) {
    return `${base}+${suffix}`;
  }
  return base + suffix;
}

function shouldAttachIntegrationConstant(base: string): boolean {
  if (/[+\-]$/.test(base)) return true;
  if (/[∫]/.test(base) || /dx/.test(base)) return true;
  return /x\^2/.test(base) && /\//.test(base);
}

function lastStudentMathLine(studentWork: string): string {
  const cleaned = stripPracticeTutorMarkup(studentWork ?? "");
  const lines = cleaned.split(/\r?\n/).map((line) => line.trim());
  let suffix = "";
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (!line) continue;
    const n = normalizeAlgebra(line);
    if (INTEGRATION_CONSTANT_LINE.test(n) && !suffix) {
      suffix =
        n.startsWith("+") || n.startsWith("plus")
          ? n.replace(/^plus/, "+")
          : `+${n}`;
      continue;
    }
    if (isIgnorableStudentWorkLine(line)) continue;
    if (suffix && shouldAttachIntegrationConstant(n)) {
      return unwrapBoardFractions(joinPlus(n, suffix));
    }
    return unwrapBoardFractions(n);
  }
  return unwrapBoardFractions(suffix);
}

/** True when the active part already has the result that part asks for. */
export function activePartLooksComplete(
  problemText: string | undefined,
  studentWork: string,
  activePartId?: string | null,
  expected?: {
    expectedAnswer: string;
    acceptedAnswers?: string[];
  } | null,
): boolean {
  const slice = workForActivePartReview(studentWork, activePartId ?? undefined);
  if (
    expected?.expectedAnswer &&
    workMatchesExpectedAnswer(
      slice,
      expected.expectedAnswer,
      expected.acceptedAnswers,
    )
  ) {
    return true;
  }
  const kind = kindForActivePart(problemText, activePartId);
  if (kind === "vertexCoordinates") {
    return workHasVertexCoordinates(problemText, slice);
  }
  if (kind === "axis") {
    return workHasAxisOfSymmetry(problemText, slice);
  }
  if (kind === "yIntercept") {
    return workHasYIntercept(problemText, slice);
  }
  if (kind === "maxMin") {
    return workHasMaxOrMin(problemText, slice);
  }
  if (kind === "graph") {
    return (
      workHasParabolaGraph(problemText, slice) ||
      workHasParabolaGraph(problemText, studentWork)
    );
  }
  return reviewVertexRewrite(problemText, slice).simplified;
}
