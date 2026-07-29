import { useNotationStore } from "../store/pinia/notationStore";
import { useQuestionStore } from "../store/pinia/questionStore";
import { useUserStore } from "../store/pinia/userStore";
import { canEdit as canEditPracticeBoard } from "./practiceBoardAdapter";

export default function authorizationHelper() {
  function canEdit() {
    const userStore = useUserStore();
    const notationStore = useNotationStore();
    const boardParent = notationStore.getParent();

    if (!boardParent) {
      return false;
    }

    if (canEditPracticeBoard()) {
      return true;
    }

    const parentType = boardParent.type;

    if (parentType === "QUESTION") {
      const question = useQuestionStore().getCurrentQuestion();
      if (question?.practice) {
        return false;
      }
      return userStore.isTeacher();
    }

    return (
      userStore.isTeacher() ||
      userStore.getAuthorized() ||
      parentType === "ANSWER"
    );
  }

  return {
    canEdit,
  };
}
