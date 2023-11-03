import { NotationAttributes } from "common/baseTypes";
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
  // sync incoming changes only if in Lesson and not initiated by me
  function isRelevant(notation: NotationAttributes) {
    if (notation.uuid === userStore.getCurrentUser().uuid) return false;
    if (notationStore.getParent().value.type !== "LESSON") return false;
    return true;
  }

  async function syncIncomingUserOperations() {
    const feathersClient = FeathersHelper.getInstance();

    // this is the gate to consume all the below events
    try {
      const t = await feathersClient.service("authentication").create({
        LessonUUId: lessonStore.getCurrentLesson().uuid,
      });
    } catch (error) {
      console.debug(error);
    }

    feathersClient
      .service("notationSync")
      .on("created", (notation: NotationAttributes) => {
        if (!isRelevant(notation)) return;
        notationStore.setNotation(notation.uuid, notation);
      });

    feathersClient
      .service("notationSync")
      .on("updated", (notation: NotationAttributes) => {
        if (!isRelevant(notation)) return;
        notationStore.getNotations().value.set(notation.uuid, notation);
      });
    feathersClient
      .service("notationSync")
      .on("removed", (notation: NotationAttributes) => {
        if (!isRelevant(notation)) return;
        notationStore.getNotations().value.set(notation.uuid, notation);
      });
    feathersClient
      .service("activeCell")
      .on("updated", (activeCell: PointAttributes) => {
        if (notationStore.getParent().value.type !== "LESSON") return;
        notationStore.setActiveCell(activeCell);
      });
    if (!this.isTeacher()) {
      feathersClient
        .service("authorization")
        .on("updated", (user: UserAttributes) => {
          if (
            user.uuid === userStore.getCurrentUser()!.uuid //&&
            //this.getCurrentLesson().uuid === authData.LessonUUId : TODO check if neccesary since massages are listned by lesson
          ) {
            userStore.setAuthorized(user.authorized ? true : false);
          }
        });
    }
    if (this.isTeacher()) {
      feathersClient
        .service("heartbeat")
        .on("updated", (user: UserAttributes) => {
          if (
            user.uuid != userStore.getCurrentUser()!.uuid &&
            notationStore.getParent().value.type === "LESSON"
          ) {
            studentStore.setStudentHeartbeat(user.uuid);
          }
        });
    }
  }

  return { syncIncomingUserOperations };
}
