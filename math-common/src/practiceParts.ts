export type PracticeProblemPart = {
  id: string;
  text: string;
};

export const ACTIVE_LINE_PREFIX = "<<active>>";

// `(4)y=5` is a label; `(2,-3)` is a coordinate, not part 2.
const LINE_PART_RE =
  /^\s*(?:\((\d{1,2}|[a-d])\)(?!,)\s*|(?:(\d{1,2}|[a-d])[.)])\s+)(.+)$/i;
const INLINE_PART_RE =
  /(?:^|\s)(?:\((\d{1,2}|[a-d])\)|(\d{1,2}|[a-d])\.)\s+(?=[A-Z])/gi;
const HEADER_ONLY_RE =
  /^\s*(?:\((\d{1,2}|[a-d])\)|(\d{1,2}|[a-d])[.)])\s*$/i;
const TASK_START_RE =
  /^(write|state|find|determine|sketch|calculate|compute|solve|show|prove|evaluate|simplify|factor|expand|graph|label|give|name|identify|express|rewrite|complete|convert|round|estimate|compare|explain|list|draw|plot|describe|obtain|derive|verify|check|work out|find out)\b/i;
const QUESTION_START_RE = /^(what|which|how|why|where|when)\b/i;
const SETUP_START_RE =
  /^(given|let |consider|using)\b/i;
const GIVEN_PROSE_RE =
  /^(a|an|the)\s+\w[\w\s,.'-]*(is given|is shown|has |have |is a |are )/i;
const CONTINUATION_RE =
  /^(and|or|of|with|to the|then|clearly|including)\b/i;

function partId(a?: string, b?: string): string {
  return (a || b || "").toLowerCase();
}

function lineParts(text: string): PracticeProblemPart[] {
  const out: PracticeProblemPart[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(LINE_PART_RE);
    if (!m) continue;
    const textBody = m[3].trim();
    if (!textBody) continue;
    out.push({ id: partId(m[1], m[2]), text: textBody });
  }
  return out;
}

function inlineParts(text: string): PracticeProblemPart[] {
  const compact = text.replace(/\s+/g, " ").trim();
  const marks: Array<{ id: string; start: number; bodyAt: number }> = [];
  INLINE_PART_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = INLINE_PART_RE.exec(compact))) {
    marks.push({
      id: partId(m[1], m[2]),
      start: m.index,
      bodyAt: m.index + m[0].length,
    });
  }
  if (marks.length < 2) return [];
  return marks.map((mark, i) => {
    const end = i + 1 < marks.length ? marks[i + 1].start : compact.length;
    return { id: mark.id, text: compact.slice(mark.bodyAt, end).trim() };
  });
}

function isContinuation(line: string): boolean {
  if (CONTINUATION_RE.test(line)) return true;
  if (
    /^[a-z]/.test(line) &&
    !/^[xyz]\s*=/.test(line) &&
    !/^f\s*\(/.test(line)
  ) {
    return true;
  }
  return false;
}

function coalesceRows(text: string): string[] {
  const merged: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (merged.length > 0 && isContinuation(line)) {
      merged[merged.length - 1] += " " + line;
    } else {
      merged.push(line);
    }
  }
  return merged;
}

function isSetupLine(line: string): boolean {
  if (SETUP_START_RE.test(line) || GIVEN_PROSE_RE.test(line)) return true;
  const letters = line.replace(/[^a-z]/gi, "");
  return line.includes("=") && letters.length <= 8;
}

function isTaskLine(line: string): boolean {
  if (/\?\s*$/.test(line) || QUESTION_START_RE.test(line)) return true;
  return TASK_START_RE.test(line);
}

function isPromptLine(line: string): boolean {
  if (isSetupLine(line)) return false;
  if (isTaskLine(line)) return true;
  return line.length >= 3 && line.length <= 160;
}

function numberParts(texts: string[]): PracticeProblemPart[] {
  return texts.slice(0, 12).map((text, i) => ({
    id: String(i + 1),
    text,
  }));
}

/** Unnumbered stem: each task/prompt row is a part; given/setup rows are skipped. */
function rowParts(text: string): PracticeProblemPart[] {
  const rows = coalesceRows(text);
  if (rows.length < 2) return [];
  const tasks = rows.filter((r) => isTaskLine(r) && !isSetupLine(r));
  if (tasks.length >= 2) return numberParts(tasks);
  const prompts = rows.filter(isPromptLine);
  return prompts.length >= 2 ? numberParts(prompts) : [];
}

/**
 * Parts from a stem: numbered/`(a)` items first, otherwise one part per
 * task row (unnumbered multi-part). Empty if fewer than 2 parts.
 */
export function parsePracticeProblemParts(
  text: string | undefined,
): PracticeProblemPart[] {
  const raw = (text ?? "").trim();
  if (!raw) return [];
  const fromLines = lineParts(raw);
  if (fromLines.length >= 2) return fromLines.slice(0, 12);
  const fromInline = inlineParts(raw);
  if (fromInline.length >= 2) return fromInline.slice(0, 12);
  return rowParts(raw);
}

const INLINE_CUT_RE =
  /(?:^|\s)(?:\((\d{1,2}|[a-d])\)|(\d{1,2})\.)\s+(?=[A-Z])/i;

/**
 * Setup / given lines only. Numbered tasks belong in the parsed part list,
 * so the UI can show preamble + parts without repeating the stem.
 */
export function practiceProblemPreamble(
  text: string | undefined,
  parts: PracticeProblemPart[],
): string {
  const raw = (text ?? "").trim();
  if (!raw) return "";
  if (parts.length < 2) return raw;

  const partTexts = new Set(
    parts.map((p) => p.text.trim().toLowerCase()).filter(Boolean),
  );

  const fromInline = inlineParts(raw);
  if (fromInline.length >= 2) {
    const compact = raw.replace(/\s+/g, " ");
    const cut = compact.search(INLINE_CUT_RE);
    return cut > 0 ? compact.slice(0, cut).trim() : "";
  }

  const lines: string[] = [];
  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (LINE_PART_RE.test(line) || HEADER_ONLY_RE.test(line)) continue;
    const body = line.replace(LINE_PART_RE, "$3").trim() || line;
    if (partTexts.has(line.toLowerCase()) || partTexts.has(body.toLowerCase())) {
      continue;
    }
    if (isTaskLine(line) && !isSetupLine(line)) continue;
    lines.push(line);
  }
  return lines.join("\n").trim();
}

export function formatPracticePartsBlock(
  parts: PracticeProblemPart[],
): string {
  if (parts.length < 2) return "";
  const list = parts.map((p) => `(${p.id}) ${p.text}`).join("\n");
  return `This problem has ${parts.length} parts:\n${list}`;
}

/**
 * After submit, always at least one numbered section. Parse as today;
 * 0–1 parts become `(1) Whole problem` (full stem stays in problemText).
 */
export function ensureNumberedParts(
  text: string | undefined,
): PracticeProblemPart[] {
  const parsed = parsePracticeProblemParts(text);
  if (parsed.length >= 2) return parsed;
  return [{ id: "1", text: parsed[0]?.text || "Whole problem" }];
}

/** Force ids `"1".."n"` (image OCR must not mix `a` with stamped `(1)`). */
export function normalizeExtractedParts(
  parts: PracticeProblemPart[] | null | undefined,
): PracticeProblemPart[] {
  const cleaned = (parts ?? [])
    .map((p) => ({
      id: String(p?.id ?? "").trim(),
      text: String(p?.text ?? "").trim(),
    }))
    .filter((p) => p.text)
    .slice(0, 12);
  if (cleaned.length === 0) {
    return [{ id: "1", text: "Whole problem" }];
  }
  return cleaned.map((p, i) => ({ id: String(i + 1), text: p.text }));
}

export function partLabelText(id: string): string {
  return `(${id})`;
}

export function isPracticePartLabelOnly(text: string): boolean {
  return HEADER_ONLY_RE.test(text.trim());
}

export function detectLinePartId(line: string): string | null {
  const headed = promotePracticePartHeader(line);
  const m = headed.match(/^\[Part\s+([^\]]+)\]/i);
  return m ? m[1].trim().toLowerCase() : null;
}

/**
 * Active-part block for Check/Coach. Always includes the active line when
 * there is at least one part (including a single Whole problem section).
 */
export function formatPracticeActiveContext(
  parts: PracticeProblemPart[],
  activePartId?: string,
): string {
  if (parts.length === 0) return "";
  const list =
    parts.length === 1
      ? `(${parts[0].id}) ${parts[0].text}`
      : `This problem has ${parts.length} parts:\n` +
        parts.map((p) => `(${p.id}) ${p.text}`).join("\n");
  const wanted = (activePartId ?? parts[0].id).toLowerCase();
  const active =
    parts.find((p) => p.id.toLowerCase() === wanted) ?? parts[0];
  return `${list}

Active part: (${active.id}) ${active.text}
Grade/coach ONLY the work under [Part ${active.id}] or marked <<active>>.
Work under [Part N] is part N — including lines after that header until the next [Part].
Lines under unlabeled: are work written before a (n) mark. If the active part is the first part, treat unlabeled lines as that part — do not ignore them.
Always use the LATEST math line in that part. Do not restart from an earlier rewrite.
Do not say they put an answer in the wrong part if it is already under the matching [Part] block.
The constant term of the given function (e.g. +5) is not the y-intercept. A lone y= number is not finished — the y-intercept is the point (0, …) or f(0)=.
Do not mark the whole question correct because an earlier part is done.
correct means the Active part is answered, not the whole worksheet.`;
}

/**
 * Group lines under `[Part N]`. A label starts a part; following unlabeled
 * lines stay in that part until the next label. Lines before any label are scratch.
 * `<<active>>` marks the last line of the active part (or a placeholder).
 */
export function formatStudentWorkByParts(
  lines: string[],
  activePartId: string | null | undefined,
): string {
  const labeled: { id: string; body: string }[] = [];
  const unlabeled: string[] = [];
  let currentId: string | null = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const headed = promotePracticePartHeader(trimmed);
    const id = detectLinePartId(trimmed);
    if (id) {
      currentId = id;
      const body = headed.replace(/^\[Part\s+[^\]]+\]\s*/i, "").trim();
      labeled.push({ id, body });
      continue;
    }
    if (currentId) {
      labeled.push({ id: currentId, body: trimmed });
    } else {
      unlabeled.push(trimmed);
    }
  }

  const ids: string[] = [];
  for (const item of labeled) {
    if (!ids.includes(item.id)) ids.push(item.id);
  }

  const chunks: string[] = [];
  const active = (activePartId ?? "").toLowerCase();
  let markedActive = false;

  for (const id of ids) {
    const group = labeled.filter((item) => item.id === id);
    chunks.push(`[Part ${id}]`);
    group.forEach((item, i) => {
      const isLast = i === group.length - 1;
      const isActive = active !== "" && id === active && isLast;
      const text = item.body || `(none yet for part ${id})`;
      if (isActive) {
        chunks.push(`${ACTIVE_LINE_PREFIX} ${text}`);
        markedActive = true;
      } else {
        chunks.push(text);
      }
    });
  }

  if (active && !markedActive) {
    chunks.push(`[Part ${activePartId}]`);
    chunks.push(
      `${ACTIVE_LINE_PREFIX} (none yet for part ${activePartId})`,
    );
  }

  if (unlabeled.length) {
    chunks.push("unlabeled:");
    chunks.push(...unlabeled);
  }

  return chunks.join("\n").trim();
}

/** Slice the serialized blob to the active `[Part N]` block (tests + local review). */
export function workForActivePart(
  studentWork: string,
  activePartId?: string,
): string {
  const wanted = (activePartId ?? "").trim().toLowerCase();
  if (!wanted) return studentWork;
  const lines = studentWork.split(/\r?\n/);
  const chunks: string[] = [];
  let collecting = false;
  for (const line of lines) {
    const header = line.match(/^\[Part\s+([^\]]+)\]\s*$/i);
    if (header) {
      collecting = header[1].trim().toLowerCase() === wanted;
      continue;
    }
    if (/^unlabeled:\s*$/i.test(line)) {
      collecting = false;
      continue;
    }
    if (collecting) chunks.push(line);
  }
  return chunks.join("\n").trim();
}

/** Scratch written before a `(n)` mark — still the student's work. */
export function unlabeledWorkLines(studentWork: string): string {
  const lines = studentWork.split(/\r?\n/);
  const chunks: string[] = [];
  let collecting = false;
  for (const line of lines) {
    if (/^unlabeled:\s*$/i.test(line)) {
      collecting = true;
      continue;
    }
    if (/^\[Part\s+[^\]]+\]\s*$/i.test(line)) {
      collecting = false;
      continue;
    }
    if (collecting) chunks.push(line);
  }
  return chunks.join("\n").trim();
}

function firstPartIdInWork(studentWork: string): string | null {
  const m = studentWork.match(/^\[Part\s+([^\]]+)\]/m);
  return m ? m[1].trim().toLowerCase() : null;
}

function realPartLines(block: string): string {
  return block
    .split(/\r?\n/)
    .filter((line) => {
      const t = line.trim();
      if (!t) return false;
      if (/\(none yet for part /i.test(t)) return false;
      return true;
    })
    .join("\n")
    .trim();
}

/**
 * Active-part math for Check/Coach, including unlabeled scratch when that
 * scratch belongs with the first part (continuation rows above the `(1)` mark).
 */
export function workForActivePartReview(
  studentWork: string,
  activePartId?: string,
): string {
  const wanted = (activePartId ?? "").trim().toLowerCase();
  if (!wanted) {
    return realPartLines(studentWork) || studentWork;
  }
  const slice = realPartLines(workForActivePart(studentWork, wanted));
  const unlabeled = unlabeledWorkLines(studentWork);
  const firstId = firstPartIdInWork(studentWork);
  if (unlabeled && (!firstId || wanted === firstId)) {
    return [slice, unlabeled].filter(Boolean).join("\n").trim();
  }
  return slice;
}

export function promotePracticePartHeader(line: string): string {
  const trimmed = line.trim();
  const only = trimmed.match(HEADER_ONLY_RE);
  if (only) return `[Part ${partId(only[1], only[2])}]`;
  const m = trimmed.match(LINE_PART_RE);
  if (!m) return line;
  return `[Part ${partId(m[1], m[2])}] ${m[3].trim()}`;
}

export function stripPracticeTutorMarkup(text: string): string {
  return text
    .replace(/<<active>>/gi, " ")
    .replace(/\[Part\s+[^\]]+\]/gi, " ");
}

/** Prefix the active line and promote `1.` / `(a)` rows to `[Part N]`. */
export function formatPracticeStudentWorkLines(
  lines: string[],
  activeIndex: number | null,
): string {
  return lines
    .map((line, i) => {
      const headed = promotePracticePartHeader(line);
      if (activeIndex == null || i !== activeIndex) return headed;
      return `${ACTIVE_LINE_PREFIX} ${headed}`;
    })
    .join("\n")
    .trim();
}
