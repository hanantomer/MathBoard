import { BaseNotation } from "common/baseTypes";
import { useUserStore } from "../store/pinia/userStore";
import { useStudentStore } from "../store/pinia/studentStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { BoardType } from "common/enum";
import { UserAttributes } from "common/userTypes";
import { PointAttributes } from "common/baseTypes";
import useFeathersHelper from "./feathersHelper";
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
          notation.uuid !== userStore.getCurrentUser().uuid &&
          notationStore.getParent().type == BoardType.LESSON
        ) {
          notationStore.getNotations().set(notation.uuid, notation);
        }
      });

    feathersClient
      .service("notationSync")
      .on("updated", (notation: BaseNotation) => {
        if (
          notation.user.uuid !== userStore.getCurrentUser().uuid &&
          this.getParent().boardType === "lesson"
        ) {
          notationStore.getNotations().set(notation.uuid, notation);
        }
      });
    feathersClient
      .service("notationSync")
      .on("removed", (notation: BaseNotation) => {
        if (
          notation.user.uuid !== userStore.getCurrentUser().uuid &&
          this.getParent().boardType === "lesson"
        ) {
          notationStore.getNotations().set(notation.uuid, notation);
        }
      });
    feathersClient
      .service("activeCell")
      .on("updated", (activeCell: PointAttributes) => {
        if (
          //activeCell.UserId !== this.getUser().id &&
          notationStore.getParent().type === BoardType.LESSON
        ) {
          notationStore.setActiveCell(activeCell);
        }
      });
    if (!this.isTeacher()) {
      feathersClient
        .service("authorization")
        .on("updated", (user: UserAttributes) => {
          if (
            user.uuid === userStore.getCurrentUser()!.uuid //&&
            //this.getCurrentLesson().uuid === authData.LessonUUId : TODO check if neccesary since massages are listned by lesson
          ) {
            userStore.setAuthorized(user.authorized);
          }
        });
    }
    if (this.isTeacher()) {
      feathersClient
        .service("heartbeat")
        .on("updated", (user: UserAttributes) => {
          if (
            user.uuid != userStore.getCurrentUser()!.uuid &&
            notationStore.getParent().type === BoardType.LESSON
          ) {
            studentStore.setStudentHeartbeat(user.uuid);
          }
        });
    }
  }

  return { syncIncomingUserOperations }
}

