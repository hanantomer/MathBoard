import axios from "axios";
import {
  getPracticeQuestionTemplateByUUId,
  formatPracticeProblemPrompt,
} from "../../../math-common/build/practiceQuestionTemplates";
import type {
  PracticeCheckResult,
  PracticeCoachResult,
} from "../../../math-common/build/practiceQuestionTypes";

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

function normalizeLoose(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
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

function parseCheckResult(raw: string): PracticeCheckResult {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse practice check response");
  }
  const parsed = JSON.parse(jsonMatch[0]) as {
    correct?: boolean;
    feedback?: string;
    hint?: string;
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
  };
}

function buildPrompt(
  problem: string,
  expectedAnswer: string,
  acceptedAnswers: string[],
  studentWork: string,
): string {
  const accepted =
    acceptedAnswers.length > 0
      ? acceptedAnswers.map((a) => `- ${a}`).join("\n")
      : "- (none)";

  return `You are grading a student's math practice work on a digital whiteboard.

${problem}

Expected answer: ${expectedAnswer}
Also accept these equivalent forms:
${accepted}

Student work (from their board notations; may include rough work):
"""
${studentWork || "(empty — student has not written anything yet)"}
"""

Decide if the student's final answer is mathematically equivalent to the expected answer.
Ignore intermediate scratch work if a clear final answer is present.
Be lenient with spacing, parentheses order for products, and equivalent notations (e.g. x^2 vs x²).

Respond with ONLY valid JSON (no markdown):
{"correct":true|false,"feedback":"one short sentence","hint":"optional short hint if incorrect"}`;
}

async function generateWithModel(
  apiKey: string,
  modelName: string,
  prompt: string,
): Promise<string> {
  const url = `${GEMINI_API_BASE}/${modelName}:generateContent`;
  const { data: payload, status, statusText } =
    await axios.post<GeminiGenerateResponse>(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: buildGenerationConfig(modelName),
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

export async function checkPracticeWork(
  questionUUId: string,
  studentWork: string,
): Promise<PracticeCheckResult> {
  const template = getPracticeQuestionTemplateByUUId(questionUUId);
  if (!template) {
    throw new Error("practice question template not found");
  }

  const work = (studentWork ?? "").trim();
  if (!work) {
    return {
      correct: false,
      feedback: "Add your answer on the board, then check again.",
      hint: "Work below the problem stem, then press Check.",
    };
  }

  // Fast path when the board clearly contains an accepted answer form.
  if (
    localQuickMatch(work, template.expectedAnswer, template.acceptedAnswers)
  ) {
    return {
      correct: true,
      feedback: "Correct — that matches the expected answer.",
    };
  }

  const apiKey = getApiKey();
  const prompt = buildPrompt(
    formatPracticeProblemPrompt(template),
    template.expectedAnswer,
    template.acceptedAnswers ?? [],
    work,
  );

  let lastError: unknown;
  for (const modelName of resolveModels()) {
    try {
      const raw = await generateWithModel(apiKey, modelName, prompt);
      return parseCheckResult(raw);
    } catch (err) {
      lastError = err;
      if (process.env.NODE_ENV === "development") {
        console.debug(
          `[practiceCheck] ${modelName} failed:`,
          err instanceof Error ? err.message : err,
        );
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Practice check failed");
}

function buildCoachPrompt(
  problem: string,
  expectedAnswer: string,
  studentWork: string,
): string {
  return `You are a brief math voice coach for a student working on a whiteboard.

${problem}

Expected final answer (do not reveal unless they already have it): ${expectedAnswer}

Student's current board work:
"""
${studentWork}
"""

Give ONE short spoken tip (max 18 words) about their next useful step or a quick encouragement if they are on track.
Do not solve the whole problem. Do not use markdown or emoji.
If there is nothing useful to say yet, respond with speak=false.

Respond with ONLY valid JSON:
{"speak":true|false,"tip":"short sentence"}`;
}

function parseCoachResult(raw: string): PracticeCoachResult {
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
  const speak = parsed.speak !== false && tip.length > 0;
  return { speak, tip: speak ? tip : "" };
}

export async function coachPracticeWork(
  questionUUId: string,
  studentWork: string,
): Promise<PracticeCoachResult> {
  const template = getPracticeQuestionTemplateByUUId(questionUUId);
  if (!template) {
    throw new Error("practice question template not found");
  }

  const work = (studentWork ?? "").trim();
  if (!work) {
    return { speak: false, tip: "" };
  }

  // If they already have the answer on the board, celebrate briefly without another Gemini call.
  if (
    localQuickMatch(work, template.expectedAnswer, template.acceptedAnswers)
  ) {
    return {
      speak: true,
      tip: "Nice work. That looks like the right answer.",
    };
  }

  const apiKey = getApiKey();
  const prompt = buildCoachPrompt(
    formatPracticeProblemPrompt(template),
    template.expectedAnswer,
    work,
  );

  // Shorter generation for voice tips
  const coachConfig = (modelName: string) => {
    const config: Record<string, unknown> = {
      maxOutputTokens: 80,
      temperature: 0.4,
      thinkingConfig: { thinkingBudget: 0 },
    };
    if (!/gemini-2\.5|gemini-3/.test(modelName)) {
      delete config.thinkingConfig;
    }
    return config;
  };

  let lastError: unknown;
  for (const modelName of resolveModels()) {
    try {
      const url = `${GEMINI_API_BASE}/${modelName}:generateContent`;
      const { data: payload, status, statusText } =
        await axios.post<GeminiGenerateResponse>(
          url,
          {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: coachConfig(modelName),
          },
          {
            params: { key: apiKey },
            validateStatus: () => true,
          },
        );
      if (status < 200 || status >= 300) {
        throw new Error(payload.error?.message ?? statusText ?? `HTTP ${status}`);
      }
      return parseCoachResult(extractText(payload));
    } catch (err) {
      lastError = err;
      if (process.env.NODE_ENV === "development") {
        console.debug(
          `[practiceCoach] ${modelName} failed:`,
          err instanceof Error ? err.message : err,
        );
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Practice coach failed");
}
