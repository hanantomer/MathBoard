import { defineStore } from "pinia";
import { ref } from "vue";
import { NotationAttributes } from "common/baseTypes";

const STORAGE_KEY = "mathboard-practice-notations";

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

export const usePracticeStore = defineStore("practice", () => {
  const notationsByQuestion = ref<Map<string, NotationAttributes[]>>(
    new Map(Object.entries(readStorage())),
  );
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

  return {
    getNotations,
    setNotations,
    upsertNotation,
    removeNotation,
    clearQuestion,
    textDraft,
    setTextDraft,
    clearTextDraft,
  };
});
