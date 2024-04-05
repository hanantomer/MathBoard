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
  ) {
    const feathersClient = FeathersHelper.getInstance();
    try {
      let t = await feathersClient!
        .service("selectedCell")
        .update(null, { ...selectedCell, lessonUUId: lessonUUId }, {});

      return t;
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

  function syncOutgoingAddNotation(notation: NotationAttributes) {
    FeathersHelper.getInstance().service("notationSync").create(notation, {});
  }

  function syncOutgoingRemoveNotation(uuid: string, lessonUUId: string) {
    let params: Params = { query: { lessonUUId: lessonUUId } };
    FeathersHelper.getInstance().service("notationSync").remove(uuid, params);
  }

  function syncOutgoingUpdateNotation(notation: NotationAttributes) {
    FeathersHelper.getInstance()
      .service("notationSync")
      .update(null, notation, {});
  }

  function syncOutgoingHeartBeat(lessonUUId: string) {
    FeathersHelper.getInstance()
      .service("heartbeat")
      .update(null, { lessonUUId: lessonUUId }, {});
  }
  // set student to be eligible to edit
  function syncOutgoingAuthorizeUser(
    authorizedStudentUUId: string | null,
    revokedStudentUUId: string | null,
    lessonUUId: string,
  ) {
    if (authorizedStudentUUId)
      FeathersHelper.getInstance().service("authorization").update(
        null,
        {
          lessonUUId: lessonUUId,
          userUUId: authorizedStudentUUId,
          authorized: true,
        },
        {},
      );
    if (revokedStudentUUId)
      FeathersHelper.getInstance().service("authorization").update(
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
