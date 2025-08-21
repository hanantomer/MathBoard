import { NotationAttributes, CellAttributes } from "common/baseTypes";
import { FeathersHelper } from "./feathersHelper";
import { Params } from "@feathersjs/feathers";

export default function userOutgoingOperations() {
  // function signedInWithGoogle() {
  //   return (
  //     gapi.auth2.getAuthInstance() &&
  //     gapi.auth2.getAuthInstance().currentUser.get().isSignedIn()
  //   );
  // };

  async function syncOutgoingSelectedCell(
    selectedCell: CellAttributes,
    lessonUUId: string,
    userUUId: string,
  ) {
    const feathersClient = await FeathersHelper.getInstance();
    try {
      await feathersClient!
        .service("selectedCell")
        .update(null, { ...selectedCell, lessonUUId: lessonUUId, userUUId: userUUId }, {});
    } catch (error) {
      console.log(error);
    }
  }

  async function syncOutgoingColorizedCell(
    cell: CellAttributes,
    lessonUUId: string,
    color: string,
  ) {
    const feathersClient = await FeathersHelper.getInstance();
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
    (await FeathersHelper.getInstance())
      .service("notationSync")
      .create(notation, {});
  }

  async function syncOutgoingRemoveNotation(uuid: string, lessonUUId: string) {
    let params: Params = { query: { lessonUUId: lessonUUId } };
    (await FeathersHelper.getInstance()).service("notationSync").remove(uuid, params);
  }

  async function syncOutgoingUpdateNotation(notation: NotationAttributes) {
    (await FeathersHelper.getInstance())
      .service("notationSync")
      .update(null, notation, {});
  }

  async function syncOutgoingHeartBeat(usreId: String, lessonUUId: string) {
    (await FeathersHelper.getInstance())
      .service("heartbeat")
      .update(null, { userUUId: usreId, lessonUUId: lessonUUId }, {});
  }
  // set student to be edit eligible
  async function syncOutgoingAuthorizeUser(
    authorizedStudentUUId: string | null,
    revokedStudentUUId: string | null,
    lessonUUId: string,
  ) {
    if (authorizedStudentUUId)
      (await FeathersHelper.getInstance()).service("authorization").update(
        null,
        {
          lessonUUId: lessonUUId,
          userUUId: authorizedStudentUUId,
          authorized: true,
        },
        {},
      );
    if (revokedStudentUUId)
      (await FeathersHelper.getInstance()).service("authorization").update(
        null,
        {
          lessonUUId: lessonUUId,
          userUUId: revokedStudentUUId,
          authorized: false,
        },
        {},
      );
  }

  return {
    syncOutgoingUpdateNotation,
    syncOutgoingSelectedCell,
    syncOutgoingColorizedCell,
    syncOutgoingAuthorizeUser,
    syncOutgoingHeartBeat,
    syncOutgoingRemoveNotation,
    syncOutgoingAddNotation,
  };
}
