import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiHintStore = defineStore("uiHint", () => {
  const highlightOnlineStudentsBtn = ref(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  function flashOnlineStudentsButton(durationMs = 4500) {
    highlightOnlineStudentsBtn.value = true;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      highlightOnlineStudentsBtn.value = false;
    }, durationMs);
  }

  return {
    highlightOnlineStudentsBtn,
    flashOnlineStudentsButton,
  };
});
