import axios from "axios";

const OCR_PROMPT = `Handwritten math on white. Return ONLY the symbol or short expression as plain text (digits, +, -, =, ×, ÷, √, π, θ, <, >, ≤, ≥, (, ), ^, /). No quotes or explanation.`;

const DEFAULT_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash-lite"];
const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

const OCR_GENERATION_CONFIG = {
  maxOutputTokens: 16,
  temperature: 0,
  thinkingConfig: { thinkingBudget: 0 },
};

type GeminiLikeError = Error & {
  status?: number;
  statusText?: string;
  errorDetails?: unknown;
  response?: { data?: unknown; status?: number; statusText?: string };
};

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { message?: string; status?: string; details?: unknown };
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

export function formatSketchOcrError(err: unknown): string {
  if (!err) {
    return "Unknown OCR error";
  }

  if (typeof err === "string") {
    return err;
  }

  if (err instanceof Error) {
    const e = err as GeminiLikeError;
    const parts: string[] = [];

    if (e.message) {
      parts.push(e.message);
    }
    if (e.status) {
      parts.push(`status ${e.status}`);
    }
    if (e.statusText) {
      parts.push(e.statusText);
    }
    if (e.errorDetails) {
      parts.push(JSON.stringify(e.errorDetails));
    }
    if (e.response?.data) {
      parts.push(JSON.stringify(e.response.data));
    }

    if (parts.length > 0) {
      return parts.join(" — ");
    }

    try {
      return JSON.stringify(err, Object.getOwnPropertyNames(err));
    } catch {
      return e.name || "Gemini API error";
    }
  }

  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/** Shorter message for API responses / UI alerts. */
export function summarizeSketchOcrError(err: unknown): string {
  const full = formatSketchOcrError(err);
  const lower = full.toLowerCase();

  if (lower.includes("not configured")) {
    return full;
  }
  if (
    lower.includes("429") ||
    lower.includes("quota") ||
    lower.includes("too many requests")
  ) {
    return (
      "Gemini API quota exceeded for this key. Enable billing or use a key with " +
      "available quota in Google AI Studio (https://aistudio.google.com/apikey), then retry."
    );
  }
  if (lower.includes("api key not valid") || lower.includes("invalid api key")) {
    return "Invalid Gemini API key. Check GEMINI_API_KEY in math-server/.env.";
  }

  return full.length > 500 ? `${full.slice(0, 500)}…` : full;
}

function isRetryableModelError(err: unknown): boolean {
  const e = err as GeminiLikeError;
  if (e.status === 404) {
    return true;
  }

  const message = formatSketchOcrError(err).toLowerCase();
  return (
    message.includes("not found") ||
    message.includes("is not supported") ||
    message.includes("unknown model")
  );
}

function extractTextFromResponse(response: GeminiGenerateResponse): string {
  const candidate = response.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  const text = parts
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  if (text) {
    return text.split("\n")[0].trim().replace(/^["'`]+|["'`]+$/g, "");
  }

  const blockReason = response.promptFeedback?.blockReason;
  const finishReason = candidate?.finishReason;
  throw new Error(
    `Gemini returned no text (blockReason=${blockReason ?? "none"}, finishReason=${finishReason ?? "none"})`,
  );
}

function resolveModels(): string[] {
  const configured = process.env.GEMINI_MODEL?.trim();
  if (configured) {
    return [configured, ...DEFAULT_MODELS.filter((m) => m !== configured)];
  }
  return DEFAULT_MODELS;
}

function buildGenerationConfig(modelName: string) {
  const config: Record<string, unknown> = { ...OCR_GENERATION_CONFIG };
  // 2.5 models spend hidden "thinking" tokens unless explicitly disabled.
  if (!modelName.includes("2.5")) {
    delete config.thinkingConfig;
  }
  return config;
}

async function generateWithModel(
  apiKey: string,
  modelName: string,
  data: string,
  mimeType: string,
): Promise<string> {
  const url = `${GEMINI_API_BASE}/${modelName}:generateContent`;
  const { data: payload, status, statusText } = await axios.post<GeminiGenerateResponse>(
    url,
    {
      contents: [
        {
          parts: [
            { text: OCR_PROMPT },
            { inlineData: { mimeType, data } },
          ],
        },
      ],
      generationConfig: buildGenerationConfig(modelName),
    },
    {
      params: { key: apiKey },
      validateStatus: () => true,
    },
  );

  if (status < 200 || status >= 300) {
    const err = new Error(
      payload.error?.message ?? statusText,
    ) as GeminiLikeError;
    err.status = status;
    err.statusText = statusText;
    err.errorDetails = payload.error?.details;
    err.response = { data: payload, status, statusText };
    throw err;
  }

  return extractTextFromResponse(payload);
}

export async function recognizeSketchFromImage(
  imageBase64: string,
): Promise<string> {
  const startedAt = Date.now();
  const apiKey = getApiKey();
  const { data, mimeType } = normalizeImageBase64(imageBase64);

  if (!data || data.length < 64) {
    throw new Error("Sketch image data is missing or too small");
  }

  const models = resolveModels();
  let lastError: unknown;

  for (const modelName of models) {
    const modelStartedAt = Date.now();
    try {
      const text = await generateWithModel(apiKey, modelName, data, mimeType);
      if (!text) {
        throw new Error("Could not recognize a symbol from the sketch");
      }
      if (process.env.NODE_ENV === "development") {
        console.debug(
          `[sketchOcr] ${modelName} ok in ${Date.now() - modelStartedAt}ms (total ${Date.now() - startedAt}ms, image ${Math.round(data.length / 1024)}KB)`,
        );
      }
      return text;
    } catch (err) {
      lastError = err;
      if (process.env.NODE_ENV === "development") {
        console.debug(
          `[sketchOcr] ${modelName} failed in ${Date.now() - modelStartedAt}ms: ${summarizeSketchOcrError(err)}`,
        );
      }
      if (!isRetryableModelError(err)) {
        throw new Error(summarizeSketchOcrError(err), { cause: err });
      }
    }
  }

  throw new Error(summarizeSketchOcrError(lastError), { cause: lastError });
}
