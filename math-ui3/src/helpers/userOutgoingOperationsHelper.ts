import { NotationAttributes, CellAttributes } from "common/baseTypes";
import { FeathersHelper } from "./feathersHelper";
import { Params } from "@feathersjs/feathers";
import { useUserStore } from "../store/pinia/userStore";
import { useNotationStore } from "../store/pinia/notationStore";
import useAuthorizationHelper from "./authorizationHelper";

export default function userOutgoingOperations() {
  const authorizationHelper = useAuthorizationHelper();

  function canSyncLessonNotation(): boolean {
    const notationStore = useNotationStore();
    if (notationStore.getParent()?.type !== "LESSON") {
      return true;
    }
    return authorizationHelper.canEdit();
  }

  async function syncOutgoingSelectedCell(
    selectedCell: CellAttributes,
    lessonUUId: string,
    userUUId: string,
  ) {
    const feathersClient = FeathersHelper.getInstance();
    try {
      await feathersClient!
        .service("selectedCell")
        .update(
          null,
          { ...selectedCell, lessonUUId: lessonUUId, userUUId: userUUId },
          {},
        );
    } catch (error) {
      console.log(error);
    }
  }

  async function syncOutgoingColorizedCell(
    cell: CellAttributes,
    lessonUUId: string,
    color: string,
  ) {
    const feathersClient = FeathersHelper.getInstance();
    try {
      let t = await feathersClient!
        .service("colorizedCell")
        .update(null, { ...cell, lessonUUId: lessonUUId, color: color }, {});

      return t;
    } catch (error) {
      console.log(error);
    }
  }

  async function syncOutgoingAddNotation(notation: NotationAttributes) {
    if (!canSyncLessonNotation()) return;
    await FeathersHelper.getInstance()
      .service("notationSync")
      .create(notation, {});
  }

  async function syncOutgoingRemoveNotation(uuid: string, lessonUUId: string) {
    if (!canSyncLessonNotation()) return;
    let params: Params = { query: { lessonUUId: lessonUUId } };
    await FeathersHelper.getInstance()
      .service("notationSync")
      .remove(uuid, params);
  }

  async function syncOutgoingUpdateNotation(notation: NotationAttributes) {
    if (!canSyncLessonNotation()) return;
    await FeathersHelper.getInstance()
      .service("notationSync")
      .update(null, notation, {});
  }

  async function syncOutgoingHeartBeat(usreId: String, lessonUUId: string) {
    const userStore = useUserStore();
    await FeathersHelper.getInstance().service("heartbeat").update(
      null,
      {
        userUUId: usreId,
        lessonUUId: lessonUUId,
        authorized: userStore.getAuthorized(),
      },
      {},
    );
  }

  async function syncOutgoingTextSync(
    notationUUId: string | null,
    userUUId: String,
    lessonUUId: string,
    text: String,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    if (!canSyncLessonNotation()) return;
    await FeathersHelper.getInstance().service("textBoxSync").update(
      null,
      {
        notationUUId: notationUUId,
        userUUId: userUUId,
        lessonUUId: lessonUUId,
        text: text,
        x: x,
        y: y,
        width: width,
        height: height,
      },
      {},
    );
  }

  function syncStopOutgoingTextSync(
    notationUUId: string | null,
    userUUId: String,
    lessonUUId: string,
  ) {
    if (!canSyncLessonNotation()) return;
   FeathersHelper.getInstance()
     .service("textBoxSync")
     .remove(null, {
       query: {
         notationUUId: notationUUId,
         userUUId: userUUId,
         lessonUUId: lessonUUId,
       },
     });
  }

  // set student to be edit eligible
  async function syncOutgoingAuthorizeUser(
    authorizedStudentUUId: string | null,
    revokedStudentUUId: string | null,
    lessonUUId: string,
  ) {
    if (authorizedStudentUUId)
      await FeathersHelper.getInstance().service("authorization").update(
        null,
        {
          lessonUUId: lessonUUId,
          userUUId: authorizedStudentUUId,
          authorized: true,
        },
        {},
      );
    if (revokedStudentUUId)
      await FeathersHelper.getInstance().service("authorization").update(
        null,
        {
          lessonUUId: lessonUUId,
          userUUId: revokedStudentUUId,
          authorized: false,
        },
        {},
      );
  }

  async function syncOutgoingLessonMediaAction(
    lessonUUId: string,
    action: "muteAll" | "unmuteAll" | "unmuteStudent" | "muteStudent",
    targetUserUUId?: string,
  ) {
    await FeathersHelper.getInstance().service("lessonMediaSync").update(
      null,
      {
        lessonUUId,
        action,
        targetUserUUId,
      },
      {},
    );
  }

  return {
    syncOutgoingUpdateNotation,
    syncOutgoingSelectedCell,
    syncOutgoingColorizedCell,
    syncOutgoingAuthorizeUser,
    syncOutgoingLessonMediaAction,
    syncOutgoingHeartBeat,
    syncOutgoingRemoveNotation,
    syncOutgoingAddNotation,
    syncOutgoingTextSync,
    syncStopOutgoingTextSync,
  };
}
