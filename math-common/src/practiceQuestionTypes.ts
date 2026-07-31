import { EntityAttributes } from "./baseTypes";
import { UserAttributes } from "./userTypes";

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
  /** Present after a successful check that consumed quota. */
  remaining?: number;
  limit?: number;
};

/** Client → server: short spoken coaching tip after a work sequence. */
export type PracticeCoachRequest = {
  questionUUId: string;
  studentWork: string;
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
