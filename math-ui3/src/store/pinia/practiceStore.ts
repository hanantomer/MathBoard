import { defineStore } from "pinia";
import { ref } from "vue";
import { NotationAttributes } from "common/baseTypes";
import type { PracticeProblemPart } from "common/practiceParts";
import { normalizeExtractedParts } from "common/practiceParts";
import {
  canActivatePart,
  orderPartLabelRowsByList,
  startedPartIdsFromSession,
  withSeededFirstPartRow,
} from "../../helpers/practicePartOrderHelper";

const STORAGE_KEY = "mathboard-practice-notations";
const SESSION_STORAGE_KEY = "mathboard-practice-sessions";

export type PracticeSession = {
  submitted: boolean;
  problemText: string | null;
  problemImageBase64: string | null;
  parts: PracticeProblemPart[];
  activePartId: string | null;
  completedPartIds: string[];
  /** Parts the student has opened, in list order. */
  startedPartIds?: string[];
  /** Last board row for each `(n)`, kept after reload when the gutter is full. */
  partLabelRows?: Record<string, number>;
};

function emptySession(): PracticeSession {
  return {
    submitted: false,
    problemText: null,
    problemImageBase64: null,
    parts: [],
    activePartId: null,
    completedPartIds: [],
    startedPartIds: [],
  };
}

function readStorage(): Record<string, NotationAttributes[]> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, NotationAttributes[]>) : {};
  } catch {
    return {};
  }
}

function writeStorage(data: Record<string, NotationAttributes[]>) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function readSessions(): Record<string, PracticeSession> {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Partial<PracticeSession>>;
    const out: Record<string, PracticeSession> = {};
    for (const [key, value] of Object.entries(parsed)) {
      const session: PracticeSession = {
        ...emptySession(),
        ...value,
        parts: Array.isArray(value.parts) ? value.parts : [],
        completedPartIds: Array.isArray(value.completedPartIds)
          ? value.completedPartIds
          : [],
        startedPartIds: Array.isArray(value.startedPartIds)
          ? value.startedPartIds
          : [],
      };
      if (session.submitted && !session.activePartId) {
        session.activePartId = session.parts[0]?.id ?? "1";
      }
      if (session.submitted) {
        session.startedPartIds = startedPartIdsFromSession(session);
        session.partLabelRows = withSeededFirstPartRow(
          session.parts,
          session.partLabelRows,
        );
      }
      out[key] = session;
    }
    return out;
  } catch {
    return {};
  }
}

function writeSessions(data: Record<string, PracticeSession>) {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
}

export const usePracticeStore = defineStore("practice", () => {
  const notationsByQuestion = ref<Map<string, NotationAttributes[]>>(
    new Map(Object.entries(readStorage())),
  );
  const sessions = ref<Record<string, PracticeSession>>(readSessions());
  const textDraft = ref<{
    value: string;
    notationUUId: string | null;
  } | null>(null);

  function getNotations(questionUUId: string): NotationAttributes[] {
    return notationsByQuestion.value.get(questionUUId) ?? [];
  }

  function persist(questionUUId: string) {
    const entries = Object.fromEntries(notationsByQuestion.value.entries());
    writeStorage(entries);
    void questionUUId;
  }

  function persistSessions() {
    writeSessions(sessions.value);
  }

  function setNotations(
    questionUUId: string,
    notations: NotationAttributes[],
  ) {
    notationsByQuestion.value.set(questionUUId, notations);
    persist(questionUUId);
  }

  function upsertNotation(
    questionUUId: string,
    notation: NotationAttributes,
  ) {
    const list = [...getNotations(questionUUId)];
    const index = list.findIndex((n) => n.uuid === notation.uuid);
    if (index >= 0) {
      list[index] = notation;
    } else {
      list.push(notation);
    }
    setNotations(questionUUId, list);
  }

  function removeNotation(questionUUId: string, notationUUId: string) {
    const list = getNotations(questionUUId).filter(
      (n) => n.uuid !== notationUUId,
    );
    setNotations(questionUUId, list);
  }

  function clearQuestion(questionUUId: string) {
    notationsByQuestion.value.delete(questionUUId);
    persist(questionUUId);
  }

  function setTextDraft(value: string, notationUUId: string | null) {
    textDraft.value = { value, notationUUId };
  }

  function clearTextDraft() {
    textDraft.value = null;
  }

  function getSession(questionUUId: string): PracticeSession {
    return sessions.value[questionUUId] ?? emptySession();
  }

  function setSession(questionUUId: string, session: PracticeSession) {
    sessions.value = { ...sessions.value, [questionUUId]: { ...session } };
    persistSessions();
  }

  function submitProblem(
    questionUUId: string,
    input: {
      problemText?: string | null;
      problemImageBase64?: string | null;
      parts: PracticeProblemPart[];
    },
  ) {
    const parts = normalizeExtractedParts(input.parts);
    const current = getSession(questionUUId);
    const keepActive =
      current.submitted &&
      current.activePartId &&
      parts.some((p) => p.id === current.activePartId);
    const activePartId = keepActive
      ? current.activePartId
      : (parts[0]?.id ?? "1");
    const completedPartIds = current.submitted ? current.completedPartIds : [];
    const partLabelRows = withSeededFirstPartRow(parts, current.partLabelRows);
    const startedPartIds = startedPartIdsFromSession({
      submitted: true,
      parts,
      startedPartIds: current.submitted ? current.startedPartIds : [],
      completedPartIds,
      activePartId,
      partLabelRows,
    });
    setSession(questionUUId, {
      submitted: true,
      problemText: input.problemText?.trim() ? input.problemText : null,
      problemImageBase64: input.problemImageBase64?.trim()
        ? input.problemImageBase64
        : null,
      parts,
      activePartId,
      completedPartIds,
      startedPartIds,
      partLabelRows,
    });
  }

  function setActivePart(questionUUId: string, partId: string): boolean {
    const current = getSession(questionUUId);
    if (!current.submitted) return false;
    if (!current.parts.some((p) => p.id === partId)) return false;
    const started = startedPartIdsFromSession(current);
    if (!canActivatePart(current.parts, started, partId)) return false;
    const startedPartIds = started.includes(partId)
      ? started
      : [...started, partId];
    setSession(questionUUId, {
      ...current,
      activePartId: partId,
      startedPartIds,
      partLabelRows: withSeededFirstPartRow(
        current.parts,
        current.partLabelRows,
      ),
    });
    return true;
  }

  function bindPartRow(questionUUId: string, partId: string, row: number) {
    const id = partId.trim();
    if (!id || typeof row !== "number" || row < 0) return;
    const current = getSession(questionUUId);
    if (!current.submitted) return;
    const rows: Record<string, number> = { ...(current.partLabelRows ?? {}) };
    const occupant = Object.entries(rows).find(
      ([otherId, otherRow]) => otherId !== id && otherRow === row,
    );
    if (occupant) return;
    rows[id] = row;
    const ordered = orderPartLabelRowsByList(current.parts, rows);
    const prev = current.partLabelRows ?? {};
    const same =
      Object.keys(prev).length === Object.keys(ordered).length &&
      Object.entries(ordered).every(([key, value]) => prev[key] === value);
    if (same) return;
    setSession(questionUUId, {
      ...current,
      partLabelRows: ordered,
    });
  }

  function markPartComplete(questionUUId: string, partId: string) {
    const current = getSession(questionUUId);
    if (!current.submitted) return;
    if (current.completedPartIds.includes(partId)) return;
    const started = startedPartIdsFromSession(current);
    const startedPartIds = started.includes(partId)
      ? started
      : [...started, partId];
    setSession(questionUUId, {
      ...current,
      completedPartIds: [...current.completedPartIds, partId],
      startedPartIds,
    });
  }

  function nextUnansweredPartId(questionUUId: string): string | null {
    const current = getSession(questionUUId);
    const next = current.parts.find(
      (p) => !current.completedPartIds.includes(p.id),
    );
    return next?.id ?? null;
  }

  function resetSession(questionUUId: string) {
    const next = { ...sessions.value };
    delete next[questionUUId];
    sessions.value = next;
    persistSessions();
    clearQuestion(questionUUId);
  }

  return {
    getNotations,
    setNotations,
    upsertNotation,
    removeNotation,
    clearQuestion,
    textDraft,
    setTextDraft,
    clearTextDraft,
    sessions,
    getSession,
    setSession,
    submitProblem,
    setActivePart,
    bindPartRow,
    markPartComplete,
    nextUnansweredPartId,
    resetSession,
  };
});
