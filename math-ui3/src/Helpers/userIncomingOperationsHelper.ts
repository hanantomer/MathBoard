import { Notation } from "./responseTypes";
import { useUserStore } from "../store/pinia/userStore";
import { useStudentStore } from "../store/pinia/studentStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { BoardType } from "../../../math-common/src/enum";
import { CellCoordinates } from "../../../math-common/src/globals";
import User from "../../../math-db/src/models/user.model";
import useFeathersHelper from "./feathersHelper";

const notationStore = useNotationStore();
const userStore = useUserStore();
const studentStore = useStudentStore();
const { client } = useFeathersHelper();

export default function userIncomingOperations() {

  async function syncIncomingUserOperations() {

    // this will route events from feathers
    await client.service("authentication").create({
      LessonUUId: this.getCurrentLesson().uuid,
    });


    client.service("notationSync").on("created", (notation: Notation) => {
      if (
        notation.uuid !== userStore.currentUser.uuid &&
        notationStore.parent.type == BoardType.LESSON
      ) {
        notationStore.notations.set(notation.uuid, notation)
      }
    });

    client.service("notationSync").on("updated", (notation: Notation) => {
      if (
        notation.user.uuid !== userStore.currentUser.uuid &&
        this.getParent().boardType === "lesson"
      ) {
        notationStore.notations.set(notation.uuid, notation);
      }
    });
    client.service("notationSync").on("removed", (notation: Notation) => {
      if (
        notation.user.uuid !== userStore.currentUser.uuid &&
        this.getParent().boardType === "lesson"
      ) {
        notationStore.notations.set(notation.uuid, notation);
      }
    });
    client
      .service("activeCell")
      .on("updated", (activeCell: CellCoordinates) => {
        if (
          //activeCell.UserId !== this.getUser().id &&
          notationStore.parent.type === BoardType.LESSON
        ) {
          notationStore.setActiveCell(activeCell);
        }
      });
    if (!this.isTeacher()) {
      client.service("authorization").on("updated", (user: User) => {
        if (
          user.uuid === userStore.currentUser.uuid //&&
          //this.getCurrentLesson().uuid === authData.LessonUUId : TODO check if neccesary since massages are listned by lesson
        ) {
          userStore.setUserWriteAuthorization(user.authorized);
        }
      });
    }
    if (this.isTeacher()) {
      client.service("heartbeat").on("updated", (user: User) => {
        if (
          user.uuid != userStore.currentUser.uuid &&
          notationStore.parent.type === BoardType.LESSON
        ) {
          studentStore.setStudentHeartbeat(user.uuid);
        }
      });
    }
  }

  return { syncIncomingUserOperations }
}

