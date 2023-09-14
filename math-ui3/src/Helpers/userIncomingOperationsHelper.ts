import { BaseNotation } from "../../../math-common/src/notationTypes";
import { useUserStore } from "../store/pinia/userStore";
import { useStudentStore } from "../store/pinia/studentStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { BoardType } from "common/enum";
import { UserAttributes } from "common/notationTypes";
import useFeathersHelper from "./feathersHelper";
import { PointAttributes } from "common/notationTypes";

const notationStore = useNotationStore();
const userStore = useUserStore();
const studentStore = useStudentStore();
const feathersHelper = useFeathersHelper();

export default function userIncomingOperations() {

  async function syncIncomingUserOperations() {

    const feathersClient = feathersHelper.init();

    // this will route events from feathers
    await feathersClient.service("authentication").create({
      LessonUUId: this.getCurrentLesson().uuid,
    });


    feathersClient
      .service("notationSync")
      .on("created", (notation: BaseNotation) => {
        if (
          notation.uuid !== userStore.currentUser!.uuid &&
          notationStore.parent.type == BoardType.LESSON
        ) {
          notationStore.notations.set(notation.uuid, notation);
        }
      });

    feathersClient
      .service("notationSync")
      .on("updated", (notation: BaseNotation) => {
        if (
          notation.user.uuid !== userStore.currentUser!.uuid &&
          this.getParent().boardType === "lesson"
        ) {
          notationStore.notations.set(notation.uuid, notation);
        }
      });
    feathersClient
      .service("notationSync")
      .on("removed", (notation: BaseNotation) => {
        if (
          notation.user.uuid !== userStore.currentUser!.uuid &&
          this.getParent().boardType === "lesson"
        ) {
          notationStore.notations.set(notation.uuid, notation);
        }
      });
    feathersClient
      .service("activeCell")
      .on("updated", (activeCell: PointAttributes) => {
        if (
          //activeCell.UserId !== this.getUser().id &&
          notationStore.parent.type === BoardType.LESSON
        ) {
          notationStore.setActiveCell(activeCell);
        }
      });
    if (!this.isTeacher()) {
      feathersClient
        .service("authorization")
        .on("updated", (user: UserAttributes) => {
          if (
            user.uuid === userStore.currentUser!.uuid //&&
            //this.getCurrentLesson().uuid === authData.LessonUUId : TODO check if neccesary since massages are listned by lesson
          ) {
            userStore.setUserWriteAuthorization(user.authorized);
          }
        });
    }
    if (this.isTeacher()) {
      feathersClient
        .service("heartbeat")
        .on("updated", (user: UserAttributes) => {
          if (
            user.uuid != userStore.currentUser!.uuid &&
            notationStore.parent.type === BoardType.LESSON
          ) {
            studentStore.setStudentHeartbeat(user.uuid);
          }
        });
    }
  }

  return { syncIncomingUserOperations }
}

