import { watch } from "vue";
import { useRouter } from "vue-router";
import { useBoardContextStore } from "../store/pinia/boardContextStore";

const BOARD_ROUTE_NAMES = new Set([
  "lessons",
  "questions",
  "answers",
  "lesson",
  "question",
  "answer",
]);

/** Keeps browser tab title in sync with the active lesson / question / answer context. */
export function useBoardDocumentTitle() {
  const boardContext = useBoardContextStore();
  const router = useRouter();

  router.afterEach((to) => {
    if (!BOARD_ROUTE_NAMES.has(to.name as string)) {
      boardContext.clear();
    }
  });

  watch(
    () => boardContext.documentTitle,
    (title) => {
      if (title) {
        document.title = title;
      }
    },
    { immediate: true },
  );
}
