import { SelectedCell, NotationAttributes } from "common/baseTypes";
import { TextSyncUpdateData, TextSyncEndData } from "common/globals";
import { useUserStore } from "../store/pinia/userStore";
import { useStudentStore } from "../store/pinia/studentStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useTextSyncStore } from "../store/pinia/textSyncStore";
import { FeathersHelper } from "./feathersHelper";
import userOutgoingOperations from "./userOutgoingOperationsHelper";
const notationStore = useNotationStore();
const cellStore = useCellStore();
const userStore = useUserStore();
const studentStore = useStudentStore();
const textSyncStore = useTextSyncStore();

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
    // feathersClient.service("authentication").create({
    //   ...userStore.getCurrentUser(),
    //   lessonUUId: lessonStore.getCurrentLesson()!.uuid,
    // });

    // sync created notations
    feathersClient
      .service("notationSync")
      .on("created", (notation: NotationAttributes) => {
        if (!isRelevant(notation) || notationStore.getNotation(notation.uuid))
          return;
        notationStore.addNotation(notation, true, true);
      });

    // sync updated notations
    feathersClient
      .service("notationSync")
      .on("updated", (notation: NotationAttributes) => {
        if (!isRelevant(notation) || !notationStore.getNotation(notation.uuid))
          return;
        notationStore.addNotation(notation, false, false);
      });

    // sync removed notations
    feathersClient
      .service("notationSync")
      .on("removed", (notation: NotationAttributes) => {
        if (!isRelevant(notation) || !notationStore.getNotation(notation.uuid))
          return;
        notationStore.deleteNotation(notation.uuid);
      });

    // sync active cell with teacher or write-authorized student
    feathersClient
      .service("selectedCell")
      .on("updated", (selectedCell: SelectedCell) => {
        if (notationStore.getParent().type !== "LESSON") return;
        if (selectedCell.userUUId == userStore.getCurrentUser()!.uuid) return;
        cellStore.setSelectedCell(selectedCell, true);
      });

    // accept write authorization as student in lesson
    if (!userStore.isTeacher()) {
      feathersClient
        .service("authorization")
        .on("updated", (authorization: any) => {
          if (authorization.userUUId === userStore.getCurrentUser()!.uuid) {
            userStore.setAuthorized(authorization.authorized ? true : false);
          }
        });
    }

    // get heartbeat signals from students
    if (userStore.isTeacher()) {
      feathersClient.service("heartbeat").on("updated", (heartbeat: any) => {
        if (
          heartbeat.userUUId != userStore.getCurrentUser()!.uuid &&
          notationStore.getParent().type === "LESSON"
        ) {
          studentStore.setStudentHeartbeat(heartbeat.userUUId);
          // auto-authorize student if teacher has authorized him previously
          if (
            !heartbeat.authorized &&
            studentStore.getAuthorizedStudentUUId() === heartbeat.userUUId
          ) {
            const helper = userOutgoingOperations();
            helper.syncOutgoingAuthorizeUser(
              heartbeat.userUUId,
              null,
              notationStore.getParent().uuid,
            );
          }
        }
      });
    }

    feathersClient
      .service("textBoxSync")
      .on("updated", (textSyncUpdateData: TextSyncUpdateData) => {
        if (textSyncUpdateData.userUUId === userStore.getCurrentUser()!.uuid)
          return;
        if (notationStore.getParent().type !== "LESSON") return;
        textSyncStore.setTextSyncUpdateData(textSyncUpdateData);
      });

    feathersClient
      .service("textBoxSync")
      .on("removed", (textSyncEndData: TextSyncEndData) => {
        if (textSyncEndData.userUUId === userStore.getCurrentUser()!.uuid)
          return;
        if (notationStore.getParent().type !== "LESSON") return;
        textSyncStore.setTextSyncEndData(textSyncEndData);
      });
  }

  return { syncIncomingUserOperations };
}
