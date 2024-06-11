import { defineStore } from "pinia";
import { ref } from "vue";

export const useTitleStore = defineStore("title", () => {
  let title = ref<String>("");

  function getTitle() {
    return title.value;
  }

  function setTitle(t: string) {
    title.value = t;
  }

  return {
    getTitle,
    setTitle,
  };
});
