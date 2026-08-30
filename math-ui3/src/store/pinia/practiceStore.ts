import { defineStore } from "pinia";
import { ref } from "vue";
import { NotationAttributes } from "common/baseTypes";
import type { PracticeProblemPart } from "common/practiceParts";
import { normalizeExtractedParts } from "common/practiceParts";

const STORAGE_KEY = "mathboard-practice-notations";
const SESSION_STORAGE_KEY = "mathboard-practice-sessions";

export type PracticeSession = {
  submitted: boolean;
  problemText: string | null;
  problemImageBase64: string | null;
  parts: PracticeProblemPart[];
  activePartId: string | null;
  completedPartIds: string[];
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
      out[key] = {
        ...emptySession(),
        ...value,
        parts: Array.isArray(value.parts) ? value.parts : [],
        completedPartIds: Array.isArray(value.completedPartIds)
          ? value.completedPartIds
          : [],
      };
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
    setSession(questionUUId, {
      submitted: true,
      problemText: input.problemText?.trim() ? input.problemText : null,
      problemImageBase64: input.problemImageBase64?.trim()
        ? input.problemImageBase64
        : null,
      parts,
      activePartId: keepActive ? current.activePartId : (parts[0]?.id ?? "1"),
      completedPartIds: current.submitted ? current.completedPartIds : [],
      partLabelRows: current.partLabelRows,
    });
  }

  function setActivePart(questionUUId: string, partId: string) {
    const current = getSession(questionUUId);
    if (!current.submitted) return;
    if (!current.parts.some((p) => p.id === partId)) return;
    setSession(questionUUId, { ...current, activePartId: partId });
  }

  function bindPartRow(questionUUId: string, partId: string, row: number) {
    const id = partId.trim();
    if (!id || typeof row !== "number" || row < 0) return;
    const current = getSession(questionUUId);
    if (!current.submitted) return;
    const rows: Record<string, number> = { ...(current.partLabelRows ?? {}) };
    for (const [otherId, otherRow] of Object.entries(rows)) {
      if (otherId !== id && otherRow === row) delete rows[otherId];
    }
    rows[id] = row;
    const prev = current.partLabelRows ?? {};
    const same =
      Object.keys(prev).length === Object.keys(rows).length &&
      Object.entries(rows).every(([key, value]) => prev[key] === value);
    if (same) return;
    setSession(questionUUId, {
      ...current,
      partLabelRows: rows,
    });
  }

  function markPartComplete(questionUUId: string, partId: string) {
    const current = getSession(questionUUId);
    if (!current.submitted) return;
    if (current.completedPartIds.includes(partId)) return;
    setSession(questionUUId, {
      ...current,
      completedPartIds: [...current.completedPartIds, partId],
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
