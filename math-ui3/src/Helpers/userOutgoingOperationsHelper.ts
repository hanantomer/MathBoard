import { CellCoordinates } from "common/globals";
import { NotationAttributes } from "common/baseTypes";
import { FeathersHelper } from "./feathersHelper";

export default function userOutgoingOperations() {



  // function signedInWithGoogle() {
  //   return (
  //     gapi.auth2.getAuthInstance() &&
  //     gapi.auth2.getAuthInstance().currentUser.get().isSignedIn()
  //   );
  // };

  async function syncOutgoingActiveCell(activeCell: CellCoordinates) {
    const feathersClient = FeathersHelper.getInstance();
    try {
      let t = await feathersClient!
        .service("activeCell")
        .update(null, { activeCell: activeCell }, {});

      return t;
    } catch (error) {
      console.log(error);
    }
  }

  function syncOutgoingAddNotation(notation: NotationAttributes) {
     FeathersHelper.getInstance().service("notationSync").create({ notation: notation }, {});
  }

  function syncOutgoingRemoveNotation(uuid: string) {
    FeathersHelper.getInstance().service("notationSync").remove(uuid, {});
  }

  function syncOutgoingUpdateNotation(selectedNotation: NotationAttributes) {
    FeathersHelper.getInstance()
      .service("notationSync")
      .update(null, { notation: selectedNotation }, {});
  }

  function syncOutgoingHeartBeat(LessonUUId: string) {
    FeathersHelper.getInstance()
      .service("heartbeat")
      .update(null, { LessonUUId: LessonUUId }, {});
  }
  // set student to be eligible to edit
  function syncOutgoingAuthUser(
    authorizedStudentUUId: string,
    revokedStudentUUId: string,
    LessonUUId: string,
  ) {

    if (authorizedStudentUUId)
      FeathersHelper.getInstance().service("authorization").update(
        null,
        {
          LessonUUId: LessonUUId,
          UserUUId: authorizedStudentUUId,
          authorized: true,
        },
        {},
      );
    if (revokedStudentUUId)
      FeathersHelper.getInstance().service("authorization").update(
        null,
        {
          LessonUUId: LessonUUId,
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
