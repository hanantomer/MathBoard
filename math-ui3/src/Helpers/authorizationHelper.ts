import { useNotationStore } from "../store/pinia/notationStore";
import { useUserStore } from "../store/pinia/userStore";
const userStore = useUserStore();
const notationStore = useNotationStore();

export default function authorizationHelper() {

  function canEdit() {
    return (
      userStore.isTeacher() || // teacher in lesson or question
      userStore.getAuthorized() || // student in lesson when authorized to edit by teacher
      notationStore.getParent().type == "ANSWER" // student writing an answer
    );
  }

  return {
    canEdit,
  };
}
