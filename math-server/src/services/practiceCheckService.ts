import axios from "axios";
import {
  getPracticeQuestionTemplateByUUId,
  formatPracticeProblemPrompt,
} from "../../../math-common/build/practiceQuestionTemplates";
import type {
  PracticeCheckResult,
  PracticeCoachPhase,
  PracticeCoachResult,
  PracticeProblemPart,
} from "../../../math-common/build/practiceQuestionTypes";
import { PRACTICE_BLANK_UUID } from "../../../math-common/build/globals";
import { reviewVertexRewrite } from "../../../math-common/build/practiceAlgebra";
import {
  formatPracticeActiveContext,
  normalizeExtractedParts,
  parsePracticeProblemParts,
  stripPracticeTutorMarkup,
} from "../../../math-common/build/practiceParts";

const DEFAULT_MODELS = ["gemini-2.5-flash", "gemini-flash-lite-latest"];
const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { message?: string; status?: string };
};

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!key?.trim()) {
    throw new Error(
      "GEMINI_API_KEY (or GOOGLE_API_KEY) is not configured on the server",
    );
  }
  return key.trim();
}

function resolveModels(): string[] {
  const configured = process.env.GEMINI_MODEL?.trim();
  if (configured) {
    return [configured, ...DEFAULT_MODELS.filter((m) => m !== configured)];
  }
  return DEFAULT_MODELS;
}

function buildGenerationConfig(modelName: string) {
  const config: Record<string, unknown> = {
    maxOutputTokens: 256,
    temperature: 0,
    thinkingConfig: { thinkingBudget: 0 },
  };
  if (!/gemini-2\.5|gemini-3/.test(modelName)) {
    delete config.thinkingConfig;
  }
  return config;
}

function extractText(payload: GeminiGenerateResponse): string {
  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .map((p) => p.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n")
    .trim();
  if (text) return text;
  throw new Error(
    `Gemini returned no text (blockReason=${payload.promptFeedback?.blockReason ?? "none"}, finishReason=${payload.candidates?.[0]?.finishReason ?? "none"})`,
  );
}

type PracticePartsCtx = {
  parts?: PracticeProblemPart[];
  activePartId?: string;
};

function resolveParts(
  problemText?: string,
  parts?: PracticeProblemPart[],
): PracticeProblemPart[] {
  if (parts && parts.length > 0) return parts;
  return parsePracticeProblemParts(problemText);
}

function partsSection(problemText?: string, ctx?: PracticePartsCtx): string {
  const block = formatPracticeActiveContext(
    resolveParts(problemText, ctx?.parts),
    ctx?.activePartId,
  );
  return block ? `${block}\n\n` : "";
}

function normalizeLoose(value: string): string {
  return stripPracticeTutorMarkup(value)
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3");
}

function localQuickMatch(
  studentWork: string,
  expectedAnswer: string,
  acceptedAnswers: string[] = [],
): boolean {
  const work = normalizeLoose(studentWork);
  if (!work) return false;
  const candidates = [expectedAnswer, ...acceptedAnswers].map(normalizeLoose);
  return candidates.some(
    (answer) => answer.length > 0 && work.includes(answer),
  );
}

/** Letters assigned to a bare number: `x=3` or `y=2,x=3`, not `3y=12` or `x=1+y`. */
function numericAssignments(work: string): Set<string> {
  const found = new Set<string>();
  const add = (letter: string | undefined) => {
    if (letter) found.add(letter.toLowerCase());
  };
  const isolated =
    /(?:^|[\s,;])([A-Za-z])\s*=\s*-?\d+(?:\.\d+)?(?![0-9./A-Za-z+\-*])/gm;
  const glued = /=\s*-?\d+(?:\.\d+)?([A-Za-z])\s*=\s*-?\d+/g;
  let m: RegExpExecArray | null;
  while ((m = isolated.exec(work))) add(m[1]);
  while ((m = glued.exec(work))) add(m[1]);
  return found;
}

function looksLikeSolvedSystem(work: string, problemText?: string): boolean {
  const assigned = numericAssignments(work);
  if (assigned.size < 2) return false;
  if (assigned.has("x") && assigned.has("y")) return true;
  const problem = (problemText ?? "").trim();
  if (!problem) return false;
  let n = 0;
  for (const v of assigned) {
    if (new RegExp(`(?:^|[^A-Za-z])${v}(?:[^A-Za-z]|$)`, "i").test(problem)) {
      n += 1;
    }
  }
  return n >= 2;
}

const COACH_DONE_TIP = "Nice work. That solves it.";
const COACH_REWRITE_WARNING_TIP =
  "Last line is right. An earlier completing-the-square step doesn't follow.";
const COACH_REWRITE_PROGRESS_TIP =
  "That rewrite still matches the original. Next, write the squared part as a binomial squared.";

function checkResultForRewrite(
  problemText: string | undefined,
  work: string,
  ctx?: PracticePartsCtx,
): PracticeCheckResult | null {
  if (resolveParts(problemText, ctx?.parts).length >= 2) return null;
  const review = reviewVertexRewrite(problemText, work);
  if (!review.equivalent) return null;
  return {
    correct: true,
    feedback: review.warning
      ? "Correct — the last line matches the original function."
      : "Correct — that rewritten form matches the original function.",
    warning: review.warning ?? undefined,
  };
}

function coachTipForRewrite(
  problemText: string | undefined,
  work: string,
  ctx?: PracticePartsCtx,
): string | null {
  const review = reviewVertexRewrite(problemText, work);
  const multiPart = resolveParts(problemText, ctx?.parts).length >= 2;
  if (review.equivalent) {
    if (multiPart) return null;
    return review.warning ? COACH_REWRITE_WARNING_TIP : COACH_DONE_TIP;
  }
  if (review.rewriteMatches) {
    return COACH_REWRITE_PROGRESS_TIP;
  }
  return null;
}

function parseCheckResult(raw: string): PracticeCheckResult {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse practice check response");
  }
  const parsed = JSON.parse(jsonMatch[0]) as {
    correct?: boolean;
    feedback?: string;
    hint?: string;
    warning?: string;
  };
  if (typeof parsed.correct !== "boolean") {
    throw new Error("Practice check response missing correct flag");
  }
  return {
    correct: parsed.correct,
    feedback:
      typeof parsed.feedback === "string" && parsed.feedback.trim()
        ? parsed.feedback.trim()
        : parsed.correct
          ? "Correct."
          : "Not quite — keep trying.",
    hint:
      typeof parsed.hint === "string" && parsed.hint.trim()
        ? parsed.hint.trim()
        : undefined,
    warning:
      typeof parsed.warning === "string" && parsed.warning.trim()
        ? parsed.warning.trim()
        : undefined,
  };
}

function buildPrompt(
  problem: string,
  expectedAnswer: string,
  acceptedAnswers: string[],
  studentWork: string,
  ctx?: PracticePartsCtx,
): string {
  const accepted =
    acceptedAnswers.length > 0
      ? acceptedAnswers.map((a) => `- ${a}`).join("\n")
      : "- (none)";

  return `You are grading a student's math practice work on a digital whiteboard.

${problem}

${partsSection(problem, ctx)}Expected answer: ${expectedAnswer}
Also accept these equivalent forms:
${accepted}

Student work (from their board notations; may include rough work):
"""
${studentWork || "(empty — student has not written anything yet)"}
"""

${CHECK_GRADE_RULES}

Respond with ONLY valid JSON (no markdown):
{"correct":true|false,"feedback":"one short sentence","hint":"optional if incorrect","warning":"optional outline of messy earlier steps if still correct"}`;
}

async function generateWithModel(
  apiKey: string,
  modelName: string,
  prompt: string,
  problemImageBase64?: string,
  generationConfig?: Record<string, unknown>,
): Promise<string> {
  const url = `${GEMINI_API_BASE}/${modelName}:generateContent`;
  const parts: Array<Record<string, unknown>> = [];
  if (problemImageBase64?.trim()) {
    const { data, mimeType } = normalizeImageBase64(problemImageBase64);
    if (!data || data.length < 64) {
      throw new Error("Problem image data is missing or too small");
    }
    // Gemini attends better when a single image comes before the text prompt.
    parts.push({ inlineData: { mimeType, data } });
  }
  parts.push({ text: prompt });

  const { data: payload, status, statusText } =
    await axios.post<GeminiGenerateResponse>(
      url,
      {
        contents: [{ parts }],
        generationConfig:
          generationConfig ?? buildGenerationConfig(modelName),
      },
      {
        params: { key: apiKey },
        validateStatus: () => true,
      },
    );

  if (status < 200 || status >= 300) {
    throw new Error(payload.error?.message ?? statusText ?? `HTTP ${status}`);
  }

  return extractText(payload);
}

function normalizeImageBase64(imageBase64: string): {
  data: string;
  mimeType: string;
} {
  const dataUrl = imageBase64.match(/^data:(image\/[\w+.-]+);base64,(.+)$/s);
  if (dataUrl) {
    return { mimeType: dataUrl[1], data: dataUrl[2].trim() };
  }
  const data = imageBase64.replace(/^data:image\/\w+;base64,/, "").trim();
  return { mimeType: "image/png", data };
}

const IMAGE_READ_RULES = `The attached image is the problem (or the cropped region of a worksheet) the student is currently working on, based on where they are writing.
It may be a photo, a scan, or a screenshot — including dark mode (light text on a dark background).
Read every line and all math symbols (triangles, lengths, units, altitudes). Ignore other problems on the same page or nearby. Do not invent a different problem.
If the worksheet has multiple parts (numbered or one task per row), list them internally. The student is on the part nearest their writing (the line marked <<active>>).`;

const IMAGE_UNREADABLE_CHECK =
  '{"correct":false,"feedback":"I couldn\'t read the worksheet clearly.","hint":"Paste the question as text (Ctrl+V), or use a larger photo with dark writing on a light background."}';

const IMAGE_UNREADABLE_COACH =
  '{"speak":true,"tip":"I couldn\'t read that image clearly. Paste the question as text."}';

const CHECK_GRADE_RULES = `Decide if the student's final answer is mathematically equivalent to what the problem asks.
When they rewrite an expression over several lines, grade the LATEST simplified line only. Earlier slips they later corrected are scratch — not the answer.
If a later line is equivalent to the given function (expanded, vertex, or factored form), mark correct=true even if earlier completing-the-square or distribution lines were wrong.
If those earlier slips exist, still approve the result and put a short outline of them in "warning" (not in feedback). Example warning: "Earlier steps don't follow: 2(x-4)² used (x-4) instead of (x-2)."
Copying the original function alone is not an answer.
Do not fail them for a missing sketch, boxed answer, labels, or later multi-part items they have not started.
<<active>> marks the line they are writing now; [Part N] is a student section label. Ignore that markup as math.
When Active part: is given, grade only that part's [Part] block. Work under a different [Part] is a different sub-question.
Ignore intermediate scratch work if a clear final answer is present.
Be lenient with spacing, parentheses, and equivalent notations (e.g. x^2 vs x²).
Accept equivalent names (height vs length, width vs base) and omitted units when the numbers match.
A system is solved if each unknown is found (x=3 and y=2 is equivalent to (3,2)); do not require an ordered pair or boxed pair.
A discarded invalid extra root (e.g. negative length) is fine if the valid value is present.
Do not mark wrong for a missing boxed answer, a full sentence, or copied diagram labels.
Extra correct statements do not make the answer wrong.
Board text is grid symbols and may omit spaces; do not treat missing spaces as errors.`;

const STUDENT_WORK_LABEL =
  "Student's current board work (grid symbols, diagrams, and text boxes):";

const COACH_TIP_RULES = `First decide if they already answered the question. If yes: speak=false, or one short encouragement. Never ask for a next step.

If the problem has multiple parts:
- A line starting with <<active>> is where they are writing now. Coach that part only.
- [Part N] is the student's work for part N. Every line under that header belongs to N until the next [Part]. Trust that grouping; do not reassign a line to a different part.
- Do not tell them to move work that is already under the Active part's [Part] block.
- The constant term in f(x)=… (e.g. +5) or in vertex form is not the y-intercept. The y-intercept is y= or (0, …) under the y-intercept part.
- An axis of symmetry is x=… . Do not call that a y-intercept.
- Parts may be numbered in the stem, or just one task per row — use the listed parts in order.
- They are done with the WHOLE problem only when every part has an answer on the board.
- If the active part is unfinished, do not mention later parts.
- If the active part is finished and later parts remain, give one short tip for the next unanswered part.
- Unstarted later parts are not mistakes.
- Do not nag them to write 1. 2. 3. if the math already matches a part (a rewritten f(x)= is vertex form, a point is the vertex, x= is the axis).
- When "Active part:" is given, do not infer a different part from the math.

If the problem has no listed parts, they are done when the board already has the asked-for result in any equivalent form, including:
- each unknown found as a number, same line or different lines (y=2,x=3 or y=2 then x=3). That solves a system. Do not also require (3,2), a boxed pair, or a check. Do not say "now find x" if x=<number> is already on the board.
- a named value, units, or a sentence in symbols or a text box
- a later rewritten line that is equivalent to the original function (vertex or factored form). Earlier algebra slips they corrected are scratch. Do not lecture about completing the square if the last line expands to the original.
- a completing-the-square line that still expands to the original, such as 2(x^2-4x+4)-8+5 or 2(x^2-4x+4-4)+5. Adding the square inside and compensating outside (or adding and subtracting the same value inside) is valid. Do not say they forgot to add and subtract the same value. Hint only the next step: write the perfect square as a binomial squared.
If they discarded an invalid extra root (e.g. a negative length) and kept the valid value, they are done.

On a multi-part problem, those rewrite/completing-the-square rules apply to the active part only — not as "the whole question is finished."

Only if they are NOT done: give ONE short spoken tip (max 18 words) — a next useful step, a gentle correction, or brief encouragement.
If a text box is an unfinished draft, coach the math story. If it already answers the question, do not ask for more.

Do not nag about work that is already on the board:
- restating, boxing, writing an ordered pair, or "clearly writing" a result already in symbols or a text box
- relabeling a diagram that already has sides, vertices, or angles
- drawing a figure, defining variables, or copying values onto a sketch after they solved it in algebra
- adding units, a full sentence, or a boxed answer as ceremony
- spelling, "square" vs rectangle, height vs length, or other equivalent names
- plugging back in / "now check your work" when the asked-for result is already present
- completing-the-square or distribution mistakes on earlier lines after a later line is already equivalent
Treat "inferred right angle" / "figure ~N°" as geometry of the drawing, not a value they wrote.
Board text is grid symbols and may omit spaces; do not treat missing spaces as errors.

Do not rewrite their sentences, complete their answer, or reveal the final answer.
Never quote numbers from "Expected final answer" unless they already appear in the student work.
Do not tell them to press Check. Do not solve the whole problem. Do not use markdown or emoji.
If they are finished, or there is nothing useful to say, respond with speak=false.

Respond with ONLY valid JSON:
{"speak":true|false,"tip":"short sentence"}`;

const COACH_PRELIMINARY_RULES = `The student just submitted this problem and has not started solving yet.
Give ONE short spoken tip (max 22 words) that orients them: what kind of problem this is, what they need to find, or the first useful step.
Name the mathematical target (e.g. both x and y), not a notation format. Do not require an ordered pair, yellow box, boxed answer, or units sentence.
If the problem has 3 or more parts, you may mention once that numbering answers (1, 2, 3) to match the question helps. Do not make labeling the main instruction.
Do not solve the problem. Do not reveal the final answer, a formula that finishes it, or a full method.
Do not ask them to copy the problem onto the board.
Do not use markdown or emoji.
If you can read the problem, always respond with speak=true.

Respond with ONLY valid JSON:
{"speak":true|false,"tip":"short sentence"}`;

function coachRules(phase?: PracticeCoachPhase): string {
  return phase === "preliminary" ? COACH_PRELIMINARY_RULES : COACH_TIP_RULES;
}

function studentWorkForPrompt(
  studentWork: string,
  phase?: PracticeCoachPhase,
): string {
  if (studentWork.trim()) return studentWork;
  if (phase === "preliminary") {
    return "(none yet — they just submitted the problem)";
  }
  return studentWork;
}

function buildBlankTextCheckPrompt(
  problemText: string,
  studentWork: string,
  ctx?: PracticePartsCtx,
): string {
  return `You are grading a student's math practice work on a digital whiteboard.

The problem the student is solving (pasted as text) is:
"""
${problemText}
"""

${partsSection(problemText, ctx)}Student work (from their board notations; may include rough work):
"""
${studentWork || "(empty — student has not written anything yet)"}
"""

${CHECK_GRADE_RULES}
Do not treat the problem statement itself as the student's answer.

Respond with ONLY valid JSON (no markdown):
{"correct":true|false,"feedback":"one short sentence","hint":"optional if incorrect","warning":"optional outline of messy earlier steps if still correct"}`;
}

function buildBlankTextCoachPrompt(
  problemText: string,
  studentWork: string,
  phase?: PracticeCoachPhase,
  ctx?: PracticePartsCtx,
): string {
  return `You are a brief math voice coach for a student working on a whiteboard.

The problem they are solving (pasted as text) is:
"""
${problemText}
"""

${partsSection(problemText, ctx)}${STUDENT_WORK_LABEL}
"""
${studentWorkForPrompt(studentWork, phase)}
"""

${coachRules(phase)}`;
}

function buildBlankImageCheckPrompt(
  studentWork: string,
  problemText?: string,
  ctx?: PracticePartsCtx,
): string {
  return `You are grading a student's math practice work on a digital whiteboard.

${IMAGE_READ_RULES}

${partsSection(problemText, ctx)}Student work next to this problem (from their board notations; may include rough work):
"""
${studentWork || "(empty — student has not written anything yet)"}
"""

${CHECK_GRADE_RULES}
If the image is too unclear to read the problem, respond with exactly:
${IMAGE_UNREADABLE_CHECK}

Respond with ONLY valid JSON (no markdown):
{"correct":true|false,"feedback":"one short sentence","hint":"optional if incorrect","warning":"optional outline of messy earlier steps if still correct"}`;
}

function buildBlankImageCoachPrompt(
  studentWork: string,
  phase?: PracticeCoachPhase,
  problemText?: string,
  ctx?: PracticePartsCtx,
): string {
  return `You are a brief math voice coach for a student working on a whiteboard.

${IMAGE_READ_RULES}

${partsSection(problemText, ctx)}Student's current board work next to this problem (grid symbols, diagrams, and text boxes):
"""
${studentWorkForPrompt(studentWork, phase)}
"""

If the image is too unclear to read the problem, respond with exactly:
${IMAGE_UNREADABLE_COACH}

${coachRules(phase)}`;
}

async function generateTextAcrossModels(
  prompt: string,
  problemImageBase64?: string,
  generationConfigForModel?: (modelName: string) => Record<string, unknown>,
  label = "practiceAI",
): Promise<string> {
  const apiKey = getApiKey();
  let lastError: unknown;
  for (const modelName of resolveModels()) {
    try {
      return await generateWithModel(
        apiKey,
        modelName,
        prompt,
        problemImageBase64,
        generationConfigForModel?.(modelName),
      );
    } catch (err) {
      lastError = err;
      if (process.env.NODE_ENV === "development") {
        console.debug(
          `[${label}] ${modelName} failed:`,
          err instanceof Error ? err.message : err,
        );
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`${label} failed`);
}

export async function checkPracticeWork(
  questionUUId: string,
  studentWork: string,
  problemImageBase64?: string,
  problemText?: string,
  parts?: PracticeProblemPart[],
  activePartId?: string,
): Promise<PracticeCheckResult> {
  const work = (studentWork ?? "").trim();
  const image = problemImageBase64?.trim();
  const textProblem = problemText?.trim();
  const ctx: PracticePartsCtx = { parts, activePartId };
  const multiPart = resolveParts(textProblem, parts).length >= 2;

  if (questionUUId === PRACTICE_BLANK_UUID) {
    if (!image && !textProblem) {
      return {
        correct: false,
        feedback: "Paste the problem as text or a worksheet image first, then check again.",
        hint: "Use Ctrl+V to paste the question, or upload an image, then write your answer.",
      };
    }
    if (!work) {
      return {
        correct: false,
        feedback: "Add your answer on the board, then check again.",
        hint: image
          ? "Write below or beside the worksheet image, then press Check."
          : "Write your solution on the board (not in the problem text), then press Check.",
      };
    }
    const rewrite = checkResultForRewrite(textProblem, work, ctx);
    if (rewrite) return { ...rewrite, partComplete: rewrite.correct };
    const raw = image
      ? await generateTextAcrossModels(
          buildBlankImageCheckPrompt(work, textProblem, ctx),
          image,
          undefined,
          "practiceCheckBlank",
        )
      : await generateTextAcrossModels(
          buildBlankTextCheckPrompt(textProblem!, work, ctx),
          undefined,
          undefined,
          "practiceCheckBlank",
        );
    const parsed = parseCheckResult(raw);
    return { ...parsed, partComplete: parsed.correct };
  }

  const template = getPracticeQuestionTemplateByUUId(questionUUId);
  if (!template) {
    throw new Error("practice question template not found");
  }

  if (!work) {
    return {
      correct: false,
      feedback: "Add your answer on the board, then check again.",
      hint: "Work below the problem stem, then press Check.",
    };
  }

  const templateProblem = formatPracticeProblemPrompt(template);
  const rewrite = checkResultForRewrite(templateProblem, work, ctx);
  if (rewrite) return { ...rewrite, partComplete: rewrite.correct };
  if (
    !multiPart &&
    localQuickMatch(work, template.expectedAnswer, template.acceptedAnswers)
  ) {
    return {
      correct: true,
      feedback: "Correct — that matches the expected answer.",
      partComplete: true,
    };
  }

  const prompt = buildPrompt(
    templateProblem,
    template.expectedAnswer,
    template.acceptedAnswers ?? [],
    work,
    ctx,
  );

  const raw = await generateTextAcrossModels(
    prompt,
    undefined,
    undefined,
    "practiceCheck",
  );
  const parsed = parseCheckResult(raw);
  return { ...parsed, partComplete: parsed.correct };
}

function buildBlankCoachPrompt(
  studentWork: string,
  phase?: PracticeCoachPhase,
): string {
  return `You are a brief math voice coach for a student working on a blank whiteboard (pasted worksheet or free work).

${STUDENT_WORK_LABEL}
"""
${studentWorkForPrompt(studentWork, phase)}
"""

${coachRules(phase)}`;
}

function buildCoachPrompt(
  problem: string,
  expectedAnswer: string,
  studentWork: string,
  phase?: PracticeCoachPhase,
  ctx?: PracticePartsCtx,
): string {
  return `You are a brief math voice coach for a student working on a whiteboard.

${problem}

${partsSection(problem, ctx)}Expected final answer (do not reveal unless they already have it): ${expectedAnswer}

${STUDENT_WORK_LABEL}
"""
${studentWorkForPrompt(studentWork, phase)}
"""

${coachRules(phase)}`;
}

function parseCoachResult(
  raw: string,
  studentWork = "",
  problemText = "",
  ctx?: PracticePartsCtx,
): PracticeCoachResult {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse practice coach response");
  }
  const parsed = JSON.parse(jsonMatch[0]) as {
    speak?: boolean;
    tip?: string;
  };
  const tip =
    typeof parsed.tip === "string" ? parsed.tip.trim().replace(/\s+/g, " ") : "";
  const rewriteTip = coachTipForRewrite(problemText, studentWork, ctx);
  if (rewriteTip) {
    return { speak: true, tip: rewriteTip };
  }
  const multiPart = resolveParts(problemText, ctx?.parts).length >= 2;
  if (
    !multiPart &&
    (coachAsksToFindAlreadyAssigned(tip, studentWork) ||
      coachAcknowledgedDoneThenAskedMore(tip))
  ) {
    return { speak: true, tip: COACH_DONE_TIP };
  }
  const speak = parsed.speak !== false && tip.length > 0;
  return { speak, tip: speak ? tip : "" };
}

function coachAsksToFindAlreadyAssigned(tip: string, work: string): boolean {
  const assigned = numericAssignments(work);
  if (assigned.size === 0) return false;
  const t = tip.toLowerCase();
  for (const v of assigned) {
    if (new RegExp(`\\b(?:find|solve\\s+for)\\s+${v}\\b`).test(t)) return true;
  }
  return false;
}

/** Model often admits they finished, then still asks for a boxed pair / check. */
function coachAcknowledgedDoneThenAskedMore(tip: string): boolean {
  const t = tip.toLowerCase();
  const foundIt =
    /you have found|you've found|you have solved|already (found|solved|have)|values for x and y|that (looks|is) (like )?(the )?(right|correct) answer/.test(
      t,
    );
  const stillNagging =
    /next step|what('s| is) (the )?next|now (write|state|box|check|verify|plug|use|find)|ordered pair|write it as|find x|find y/.test(
      t,
    );
  return foundIt && stillNagging;
}

function coachGenerationConfig(modelName: string): Record<string, unknown> {
  const config: Record<string, unknown> = {
    maxOutputTokens: 80,
    temperature: 0.4,
    thinkingConfig: { thinkingBudget: 0 },
  };
  if (!/gemini-2\.5|gemini-3/.test(modelName)) {
    delete config.thinkingConfig;
  }
  return config;
}

async function generateCoachTip(
  prompt: string,
  problemImageBase64?: string,
  studentWork = "",
  problemText = "",
  ctx?: PracticePartsCtx,
): Promise<PracticeCoachResult> {
  const raw = await generateTextAcrossModels(
    prompt,
    problemImageBase64,
    coachGenerationConfig,
    "practiceCoach",
  );
  return parseCoachResult(raw, studentWork, problemText, ctx);
}

export async function coachPracticeWork(
  questionUUId: string,
  studentWork: string,
  problemImageBase64?: string,
  problemText?: string,
  phase?: PracticeCoachPhase,
  parts?: PracticeProblemPart[],
  activePartId?: string,
): Promise<PracticeCoachResult> {
  const work = (studentWork ?? "").trim();
  const isPreliminary = phase === "preliminary";
  if (!work && !isPreliminary) {
    return { speak: false, tip: "" };
  }

  const image = problemImageBase64?.trim();
  const textProblem = problemText?.trim();
  const ctx: PracticePartsCtx = { parts, activePartId };
  const multiPart = resolveParts(textProblem, parts).length >= 2;

  if (
    !isPreliminary &&
    !multiPart &&
    looksLikeSolvedSystem(work, textProblem)
  ) {
    return { speak: true, tip: COACH_DONE_TIP };
  }

  if (!isPreliminary) {
    const rewriteTip = coachTipForRewrite(textProblem, work, ctx);
    if (rewriteTip) return { speak: true, tip: rewriteTip };
  }

  if (questionUUId === PRACTICE_BLANK_UUID) {
    if (!work && !image && !textProblem) {
      return { speak: false, tip: "" };
    }
    if (image) {
      return generateCoachTip(
        buildBlankImageCoachPrompt(work, phase, textProblem, ctx),
        image,
        work,
        textProblem,
        ctx,
      );
    }
    if (textProblem) {
      return generateCoachTip(
        buildBlankTextCoachPrompt(textProblem, work, phase, ctx),
        undefined,
        work,
        textProblem,
        ctx,
      );
    }
    return generateCoachTip(
      buildBlankCoachPrompt(work, phase),
      undefined,
      work,
      "",
      ctx,
    );
  }

  const template = getPracticeQuestionTemplateByUUId(questionUUId);
  if (!template) {
    throw new Error("practice question template not found");
  }

  const templateProblem = formatPracticeProblemPrompt(template);
  const rewriteTip = work
    ? coachTipForRewrite(templateProblem, work, ctx)
    : null;
  if (rewriteTip) return { speak: true, tip: rewriteTip };
  if (
    !multiPart &&
    work &&
    localQuickMatch(work, template.expectedAnswer, template.acceptedAnswers)
  ) {
    return {
      speak: true,
      tip: "Nice work. That looks like the right answer.",
    };
  }

  return generateCoachTip(
    buildCoachPrompt(
      templateProblem,
      template.expectedAnswer,
      work,
      phase,
      ctx,
    ),
    undefined,
    work,
    templateProblem,
    ctx,
  );
}

const WHOLE_PROBLEM = [{ id: "1", text: "Whole problem" }];

export async function extractPracticeParts(
  problemImageBase64?: string,
  problemText?: string,
): Promise<{ parts: PracticeProblemPart[] }> {
  const image = problemImageBase64?.trim();
  const text = problemText?.trim();
  if (!image && !text) {
    return { parts: WHOLE_PROBLEM };
  }

  const prompt = `List the distinct tasks in this math worksheet as JSON.
Use ids 1, 2, 3 even if the worksheet used a/b or one task per row.
Ignore given equations, titles, and setup as parts.
Max 12 parts.
If you cannot read it or there is only one task, return one part with text "Whole problem".
${text ? `\nOptional accompanying text:\n"""\n${text}\n"""\n` : ""}
Respond with ONLY valid JSON (no markdown):
{"parts":[{"id":"1","text":"short task"}]}`;

  try {
    const raw = await generateTextAcrossModels(
      prompt,
      image,
      undefined,
      "practiceParts",
    );
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { parts: WHOLE_PROBLEM };
    const parsed = JSON.parse(jsonMatch[0]) as {
      parts?: PracticeProblemPart[];
    };
    return { parts: normalizeExtractedParts(parsed.parts) };
  } catch {
    return { parts: WHOLE_PROBLEM };
  }
}
