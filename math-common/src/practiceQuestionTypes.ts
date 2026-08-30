import { EntityAttributes } from "./baseTypes";
import { UserAttributes } from "./userTypes";
import type { PracticeProblemPart } from "./practiceParts";

export type { PracticeProblemPart };

/** Metadata row in practiceQuestion (stem lives on question). */
export type PracticeQuestionMeta = EntityAttributes & {
  subject: string;
};

/** API list/create response — uuid is the question (board) uuid. */
export type PracticeQuestionListItem = {
  uuid: string;
  practiceUUId: string;
  name: string;
  subject: string;
  createdAt?: Date;
  user: UserAttributes;
};

export type PracticeQuestionCreationAttributes = {
  name: string;
  subject: string;
  user: UserAttributes;
};

export type PracticeQuestionUpdateAttributes = {
  name?: string;
  subject?: string;
};

/** Client → server: check practice work against the curated answer. */
export type PracticeCheckRequest = {
  questionUUId: string;
  /** Human-readable serialization of the student's PRACTICE-layer work. */
  studentWork: string;
  /**
   * Optional worksheet/problem image (blank-sheet practice).
   * Data URL or raw base64; used as the problem instead of a curated stem.
   */
  problemImageBase64?: string;
  /**
   * Optional pasted problem statement (blank-sheet practice).
   * Used as the problem when no worksheet image is provided.
   */
  problemText?: string;
  /** Numbered sections after submit (client session). */
  parts?: PracticeProblemPart[];
  /** Section Check/Coach should grade; not inferred from the cursor. */
  activePartId?: string;
};

/** Daily Check/Coach quota snapshot (guests and signed-in users). */
export type PracticeAiQuota = {
  remaining: number;
  limit: number;
  kind: "guest" | "user";
};

/** Server → client: Gemini (or local) grading result. */
export type PracticeCheckResult = {
  correct: boolean;
  feedback: string;
  hint?: string;
  /** Messy earlier steps when the final answer is still accepted. */
  warning?: string;
  /** Present after a successful check that consumed quota. */
  remaining?: number;
  limit?: number;
  /** Same as `correct` for now: the active part (not the whole worksheet). */
  partComplete?: boolean;
};

/** Opening tip after the problem is submitted, vs a tip while they work. */
export type PracticeCoachPhase = "preliminary" | "progress";

/** Client → server: short spoken coaching tip after a work sequence. */
export type PracticeCoachRequest = {
  questionUUId: string;
  studentWork: string;
  /** Optional worksheet/problem image for blank-sheet coaching. */
  problemImageBase64?: string;
  /** Optional pasted problem statement for blank-sheet coaching. */
  problemText?: string;
  /** Opening orientation after the student submits the problem. */
  phase?: PracticeCoachPhase;
  /** Numbered sections after submit (client session). */
  parts?: PracticeProblemPart[];
  /** Section the coach should talk about. */
  activePartId?: string;
};

/** Client → server: split a worksheet image (or text) into numbered parts. */
export type PracticePartsExtractRequest = {
  problemImageBase64?: string;
  problemText?: string;
};

export type PracticePartsExtractResult = {
  parts: PracticeProblemPart[];
  remaining?: number;
  limit?: number;
};

/** Server → client: one short tip suitable for text-to-speech. */
export type PracticeCoachResult = {
  tip: string;
  /** False when there is nothing useful to say yet. */
  speak: boolean;
  /** Present after a successful coach call that consumed quota. */
  remaining?: number;
  limit?: number;
};
