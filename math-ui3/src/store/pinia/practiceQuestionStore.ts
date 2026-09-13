import { defineStore } from "pinia";
import { ref } from "vue";
import { PracticeQuestionListItem } from "common/practiceQuestionTypes";
import useApiHelper from "../../helpers/apiHelper";
import { practiceListItemsFromTemplates } from "../../helpers/practiceQuestionList";

export const usePracticeQuestionStore = defineStore("practiceQuestion", () => {
  const items = ref<Map<string, PracticeQuestionListItem>>(new Map());
  const loading = ref(false);
  let loadGeneration = 0;

  function getItems() {
    return items.value;
  }

  function getItem(questionUUId: string) {
    return items.value.get(questionUUId);
  }

  async function loadBySubject(subject: string) {
    const gen = ++loadGeneration;
    const seeded = practiceListItemsFromTemplates(subject);
    items.value = seeded;
    loading.value = seeded.size === 0;

    try {
      const api = useApiHelper();
      const rows = await api.getPracticeQuestions(subject);
      if (gen !== loadGeneration) return;
      if (rows.length > 0) {
        const next = new Map<string, PracticeQuestionListItem>();
        rows.forEach((row) => next.set(row.uuid, row));
        items.value = next;
      }
    } finally {
      if (gen === loadGeneration) loading.value = false;
    }
  }

  return {
    loading,
    getItems,
    getItem,
    loadBySubject,
  };
});
