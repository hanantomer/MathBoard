import { defineStore } from "pinia";
import { ref } from "vue";
import { PracticeQuestionListItem } from "common/practiceQuestionTypes";
import useApiHelper from "../../helpers/apiHelper";

export const usePracticeQuestionStore = defineStore("practiceQuestion", () => {
  const items = ref<Map<string, PracticeQuestionListItem>>(new Map());

  function getItems() {
    return items.value;
  }

  function getItem(questionUUId: string) {
    return items.value.get(questionUUId);
  }

  async function loadBySubject(subject: string) {
    const api = useApiHelper();
    items.value.clear();
    const rows = await api.getPracticeQuestions(subject);
    rows.forEach((row) => items.value.set(row.uuid, row));
  }

  return {
    getItems,
    getItem,
    loadBySubject,
  };
});
