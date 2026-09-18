import path from "path";
import winston from "winston";
import type { Request } from "express";
import { PRACTICE_BLANK_UUID } from "../../../math-common/build/globals";
import { getPracticeQuestionTemplateByUUId } from "../../../math-common/build/practiceQuestionTemplates";
import type { PracticeProblemPart } from "../../../math-common/build/practiceQuestionTypes";
import type { PracticeAiSubjectKind } from "./guestPracticeRateLimit";

const MAX_TEXT = 2000;
const MAX_PART_TEXT = 240;
const MAX_UA = 180;

export type PracticeAiAction = "check" | "coach" | "parts";
export type PracticeAiLogEvent = "consume" | "denied" | "error";

export type PracticeUserSnapshot = {
  id?: number;
  uuid?: string;
  email?: string;
  name?: string;
  userType?: string;
};

export type PracticeAiRequest = Request & {
  practiceAiKey?: string;
  practiceAiKind?: PracticeAiSubjectKind;
  practiceUser?: PracticeUserSnapshot;
};

export type PracticeAiLogDetails = {
  questionUUId?: string;
  studentWork?: string;
  problemText?: string;
  problemImageBase64?: string;
  parts?: PracticeProblemPart[];
  activePartId?: string;
  phase?: string;
  durationMs?: number;
  correct?: boolean;
  feedback?: string;
  hint?: string;
  warning?: string;
  tip?: string;
  speak?: boolean;
  partComplete?: boolean;
  extractedPartCount?: number;
  error?: string;
};

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/practice-ai-usage.log"),
    }),
  ],
});

function clip(value: string | undefined, max = MAX_TEXT): string | undefined {
  if (value == null) return undefined;
  const text = value.replace(/\u0000/g, "").trim();
  if (!text) return undefined;
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function clientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

function problemSource(
  questionUUId: string | undefined,
  problemText: string | undefined,
  hasImage: boolean,
): "catalog" | "blank-text" | "blank-image" | "blank-text-and-image" | "blank" {
  const isBlank =
    !questionUUId ||
    questionUUId === PRACTICE_BLANK_UUID ||
    questionUUId === "blank";
  if (!isBlank) return "catalog";
  if (hasImage && problemText) return "blank-text-and-image";
  if (hasImage) return "blank-image";
  if (problemText) return "blank-text";
  return "blank";
}

function imageByteLength(base64: string | undefined): number | undefined {
  if (!base64) return undefined;
  const comma = base64.indexOf(",");
  const payload = comma >= 0 ? base64.slice(comma + 1) : base64;
  if (!payload) return undefined;
  return Math.floor((payload.length * 3) / 4);
}

export function snapshotPracticeUser(
  user:
    | {
        id?: number;
        uuid?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        userType?: string;
      }
    | null
    | undefined,
): PracticeUserSnapshot | undefined {
  if (!user) return undefined;
  const name = [user.firstName, user.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  return {
    ...(user.id != null ? { id: user.id } : {}),
    ...(user.uuid ? { uuid: user.uuid } : {}),
    ...(user.email ? { email: user.email } : {}),
    ...(name ? { name } : {}),
    ...(user.userType ? { userType: user.userType } : {}),
  };
}

export function practiceDetailsFromReq(req: Request): PracticeAiLogDetails {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const partsRaw = body.parts;
  const parts = Array.isArray(partsRaw)
    ? (partsRaw as PracticeProblemPart[])
    : undefined;
  return {
    questionUUId:
      (typeof req.params.questionUUId === "string"
        ? req.params.questionUUId
        : undefined) ||
      (typeof body.questionUUId === "string" ? body.questionUUId : undefined),
    studentWork:
      typeof body.studentWork === "string" ? body.studentWork : undefined,
    problemText:
      typeof body.problemText === "string" ? body.problemText : undefined,
    problemImageBase64:
      typeof body.problemImageBase64 === "string"
        ? body.problemImageBase64
        : undefined,
    parts,
    activePartId:
      typeof body.activePartId === "string" ? body.activePartId : undefined,
    phase: typeof body.phase === "string" ? body.phase : undefined,
  };
}

function compactParts(
  parts: PracticeProblemPart[] | undefined,
): { id: string; text: string }[] | undefined {
  if (!parts?.length) return undefined;
  return parts.slice(0, 12).map((part) => ({
    id: String(part.id ?? "").trim(),
    text: clip(String(part.text ?? ""), MAX_PART_TEXT) ?? "",
  }));
}

function outcomeSummary(
  event: PracticeAiLogEvent,
  action: PracticeAiAction,
  details: PracticeAiLogDetails,
): string {
  if (event === "denied") return "quota-denied";
  if (event === "error") return details.error ? `error:${details.error}` : "error";
  if (action === "check") {
    if (details.correct === true) return "correct";
    if (details.correct === false) return "incorrect";
    return "checked";
  }
  if (action === "coach") {
    if (details.speak === true) return "spoke";
    if (details.speak === false) return "silent";
    return "coached";
  }
  if (details.extractedPartCount != null) {
    return `${details.extractedPartCount}-parts`;
  }
  return "parts";
}

export function logPracticeAiEvent(args: {
  event: PracticeAiLogEvent;
  action: PracticeAiAction;
  req: Request;
  quota?: { remaining: number; limit: number; used?: number };
  details?: PracticeAiLogDetails;
}): void {
  const aiReq = args.req as PracticeAiRequest;
  const details = { ...practiceDetailsFromReq(args.req), ...args.details };
  const questionUUId = details.questionUUId || args.req.params.questionUUId;
  const problemText = clip(details.problemText);
  const hasImage = Boolean(details.problemImageBase64?.trim());
  const source = problemSource(questionUUId, problemText, hasImage);
  const template =
    questionUUId && source === "catalog"
      ? getPracticeQuestionTemplateByUUId(questionUUId)
      : undefined;
  const kind: PracticeAiSubjectKind =
    aiReq.practiceAiKind ?? (aiReq.practiceUser || args.req.headers.userId
      ? "user"
      : "guest");
  const user = aiReq.practiceUser;
  const actorLabel =
    kind === "user"
      ? user?.email || user?.name || `user:${args.req.headers.userId ?? "?"}`
      : aiReq.practiceAiKey || "guest";
  const exercise = template?.name;
  const submitted =
    source === "catalog"
      ? exercise
      : problemText || (hasImage ? "(worksheet image)" : undefined);
  const outcome = outcomeSummary(args.event, args.action, details);
  const studentWork = clip(details.studentWork);

  const payload: Record<string, unknown> = {
    event: args.event,
    action: args.action,
    at: new Date().toISOString(),
    day: new Date().toISOString().slice(0, 10),
    actor: kind,
    actorLabel,
    kind,
    subject: aiReq.practiceAiKey,
    ip: clientIp(args.req),
    userAgent: clip(
      typeof args.req.headers["user-agent"] === "string"
        ? args.req.headers["user-agent"]
        : undefined,
      MAX_UA,
    ),
    source,
    questionUUId,
    exercise,
    subjectName: template?.subject,
    difficulty: template?.difficulty,
    templateId: template?.id,
    submitted,
    problemText,
    hasProblemImage: hasImage || undefined,
    problemImageBytes: imageByteLength(details.problemImageBase64),
    studentWork,
    studentWorkChars: details.studentWork?.trim().length || undefined,
    activePartId: details.activePartId,
    parts: compactParts(details.parts),
    partCount: details.parts?.length || details.extractedPartCount,
    phase: details.phase,
    correct: details.correct,
    partComplete: details.partComplete,
    feedback: clip(details.feedback, 400),
    hint: clip(details.hint, 400),
    warning: clip(details.warning, 400),
    tip: clip(details.tip, 400),
    speak: details.speak,
    durationMs: details.durationMs,
    error: clip(details.error, 500),
    remaining: args.quota?.remaining,
    limit: args.quota?.limit,
    used: args.quota?.used,
    outcome,
    message: [
      args.event,
      args.action,
      kind === "user" ? `user:${actorLabel}` : actorLabel,
      source === "catalog"
        ? `exercise:${exercise || questionUUId || "?"}`
        : `manual:${submitted || "empty"}`,
      outcome,
      details.durationMs != null ? `${details.durationMs}ms` : undefined,
    ]
      .filter(Boolean)
      .join(" | "),
  };

  if (user) {
    payload.userId = user.id;
    payload.userUuid = user.uuid;
    payload.email = user.email;
    payload.name = user.name;
    payload.userType = user.userType;
  }

  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    cleaned[key] = value;
  }

  logger.info(cleaned);
}
