// notations of current board(lesson, question or answers)
//  questions of current lesson
import { defineStore } from "pinia";
import { ref, reactive } from "vue";

export const useGlobalAlertStore = defineStore("globalAlert", () => {

  const show = ref(false);
  const type = ref<"info" | "warning" | "error" | "success">("info");
  const message = ref("");
  const title = ref("");
  let result = ref(false);
  let callback = ref(() => {});

  const options = reactive({
    color: "primary",
    width: 290,
    zIndex: 200,
  });

  function open(
    titleText: string,
    messageText: string,
    alertType: "info" | "warning" | "error" | "success" = "warning",
    cb: () => void
  ): void {
    title.value = titleText;
    message.value = messageText;
    type.value = alertType;
    show.value = true;
    callback.value = cb;
  }

  return {
    show,
    title,
    message,
    type,
    options,
    result,
    open,
    callback
  };
});
