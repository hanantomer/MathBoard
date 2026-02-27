import { defineStore } from "pinia";
import { ref } from "vue";

export const useTitleStore = defineStore("title", () => {
  let title = ref<String>("");

  function getTitle() {
    return title.value;
  }

  function setTitle(newTitle: string) {
    title.value = newTitle;
  }

  return {
    getTitle,
    setTitle,
  };
});
