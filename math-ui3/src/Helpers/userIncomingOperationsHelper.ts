import { SelectedCell, NotationAttributes } from "common/baseTypes";
import { useUserStore } from "../store/pinia/userStore";
import { useStudentStore } from "../store/pinia/studentStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { UserAttributes } from "common/userTypes";
import { PointAttributes } from "common/baseTypes";
import { FeathersHelper } from "./feathersHelper";
const notationStore = useNotationStore();
const lessonStore = useLessonStore();
const userStore = useUserStore();
const studentStore = useStudentStore();

export default function userIncomingOperations() {
  // check if in Lesson and not initiated by me
  function isRelevant(notation: NotationAttributes) {
    if (notation.user.uuid === userStore.getCurrentUser()!.uuid) return false;
    if (notationStore.getParent().type !== "LESSON") return false;
    return true;
  }

  async function syncIncomingUserOperations() {
    const feathersClient = FeathersHelper.getInstance();

    // send auth token to server and register to accept messsages.
    // see also AuthenticationService
    feathersClient.service("authentication").create({
      lessonUUId: lessonStore.getCurrentLesson()!.uuid,
    });

    // sync created notations
    feathersClient
      .service("notationSync")
      .on("created", (notation: NotationAttributes) => {
        if (!isRelevant(notation)) return;
        notationStore.addNotation(notation);
      });

    // sync updated notations
    feathersClient
      .service("notationSync")
      .on("updated", (notation: NotationAttributes) => {
        if (!isRelevant(notation)) return;
        notationStore.addNotation(notation);
      });

    // sync removed notations
    feathersClient
      .service("notationSync")
      .on("removed", (notation: NotationAttributes) => {
        if (!isRelevant(notation)) return;
        notationStore.deleteNotation(notation.uuid);
      });

    // sync active cell with teacher or write authorized student
    feathersClient
      .service("selectedCell")
      .on("updated", (selectedCell: SelectedCell) => {
        if (notationStore.getParent().type !== "LESSON") return;
        if (selectedCell.userUUId == userStore.getCurrentUser()!.uuid) return;
        notationStore.selectCell(selectedCell);
      });

    // accept write authorization as student in lesson
    if (!userStore.isTeacher()) {
      feathersClient
        .service("authorization")
        .on("updated", (user: UserAttributes) => {
          if (
            user.uuid === userStore.getCurrentUser()!.uuid //&&
          ) {
            userStore.setAuthorized(user.authorized ? true : false);
          }
        });
    }

    // get heartbeat signals from students
    if (userStore.isTeacher()) {
      feathersClient
        .service("heartbeat")
        .on("updated", (user: UserAttributes) => {
          if (
            user.uuid != userStore.getCurrentUser()!.uuid &&
            notationStore.getParent().type === "LESSON"
          ) {
            studentStore.setStudentHeartbeat(user.uuid);
          }
        });
    }
  }

  return { syncIncomingUserOperations };
}
