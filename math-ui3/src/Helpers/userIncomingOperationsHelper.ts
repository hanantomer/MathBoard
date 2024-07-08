import {
  SelectedCell,
  ColorizedCell,
  NotationAttributes,
  CellAttributes,
} from "common/baseTypes";
import { useUserStore } from "../store/pinia/userStore";
import { useStudentStore } from "../store/pinia/studentStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useCellStore } from "../store/pinia/cellStore";
import { FeathersHelper } from "./feathersHelper";
import UseMatrixCellHelper from "./matrixCellHelper";

const notationStore = useNotationStore();
const cellStore = useCellStore();
const lessonStore = useLessonStore();
const userStore = useUserStore();
const studentStore = useStudentStore();
const matrixCellHelper = UseMatrixCellHelper();

export default function userIncomingOperations() {
  // check if in Lesson and not initiated by me
  function isRelevant(notation: NotationAttributes) {
    if (notation.user.uuid === userStore.getCurrentUser()!.uuid) return false;
    if (notationStore.getParent().type !== "LESSON") return false;
    return true;
  }

  async function syncIncomingUserOperations(svgId: string) {
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

    // sync active cell with teacher or write-authorized student
    feathersClient
      .service("selectedCell")
      .on("updated", (selectedCell: SelectedCell) => {
        if (notationStore.getParent().type !== "LESSON") return;
        if (selectedCell.userUUId == userStore.getCurrentUser()!.uuid) return;
        cellStore.selectCell(selectedCell);
      });

    // sync cell colorizing
    feathersClient
      .service("colorizedCell")
      .on("updated", (colorizedCell: ColorizedCell) => {
        if (notationStore.getParent().type !== "LESSON") return;

        if (colorizedCell.userUUId == userStore.getCurrentUser()!.uuid) return;

        matrixCellHelper.colorizeCell(
          svgId,
          colorizedCell as CellAttributes,
          colorizedCell.color,
        );
      });

    // accept write authorization as student in lesson
    if (!userStore.isTeacher()) {
      feathersClient
        .service("authorization")
        .on("updated", (authorization: any) => {
          if (authorization.userUUId === userStore.getCurrentUser()!.uuid) {
            userStore.setAuthorized(authorization.authorized ? true : false);
          } else {
            const q = 1;
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
        }
      });
    }
  }

  return { syncIncomingUserOperations };
}
