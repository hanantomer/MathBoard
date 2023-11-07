import { CellCoordinates } from "common/globals";
import { NotationAttributes } from "common/baseTypes";
import { FeathersHelper } from "./feathersHelper";
import {Params } from "@feathersjs/feathers";

export default function userOutgoingOperations() {
  // function signedInWithGoogle() {
  //   return (
  //     gapi.auth2.getAuthInstance() &&
  //     gapi.auth2.getAuthInstance().currentUser.get().isSignedIn()
  //   );
  // };

  async function syncOutgoingActiveCell(
    activeCell: CellCoordinates,
    lessonUUId: string,
  ) {
    const feathersClient = FeathersHelper.getInstance();
    try {
      let t = await feathersClient!
        .service("activeCell")
        .update(null, { ...activeCell, lessonUUId: lessonUUId }, {});

      return t;
    } catch (error) {
      console.log(error);
    }
  }

  function syncOutgoingAddNotation(notation: NotationAttributes) {
    FeathersHelper.getInstance().service("notationSync").create(notation, {});
  }

  function syncOutgoingRemoveNotation(uuid: string, lessonUUId: string) {
    let params: Params = {   query: {lessonUUId: lessonUUId} }
    FeathersHelper.getInstance().service("notationSync").remove(uuid, {});
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
  function syncOutgoingAuthUser(
    authorizedStudentUUId: string,
    revokedStudentUUId: string,
    lessonUUId: string,
  ) {
    if (authorizedStudentUUId)
      FeathersHelper.getInstance().service("authorization").update(
        null,
        {
          lessonUUId: lessonUUId,
          UserUUId: authorizedStudentUUId,
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
    syncOutgoingActiveCell,
    syncOutgoingAuthUser,
    syncOutgoingHeartBeat,
    syncOutgoingRemoveNotation,
    syncOutgoingAddNotation,
  };
}
