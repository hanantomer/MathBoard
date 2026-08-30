import { stripPracticeTutorMarkup } from "./practiceParts";

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
  /** Last line is vertex form and expands to the original. */
  equivalent: boolean;
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
  rewriteMatches: false,
  warning: null,
};

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
 * Latest quadratic rewrite vs the given function. `equivalent` means vertex
 * form is done. `rewriteMatches` means a completing-the-square (or similar)
 * line still expands to the original.
 */
export function reviewVertexRewrite(
  problemText: string | undefined,
  studentWork: string,
): VertexRewriteReview {
  const work = (studentWork ?? "").trim();
  if (!work) return EMPTY_REVIEW;

  const original =
    firstStandardQuadratic(problemText ?? "") ?? firstStandardQuadratic(work);
  const last = lastQuadraticLine(work);
  if (!original || !last || !coeffsEqual(original, last.coeffs)) {
    return EMPTY_REVIEW;
  }

  const grouped = last.expr.includes("(");
  const vertexForm = isVertexFormExpr(last.expr, original);
  const notes = vertexForm ? earlierRewriteNotes(work, original) : [];
  return {
    equivalent: vertexForm,
    rewriteMatches: grouped,
    warning:
      vertexForm && notes.length > 0
        ? `Earlier steps don't follow: ${notes.join("; ")}.`
        : null,
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
