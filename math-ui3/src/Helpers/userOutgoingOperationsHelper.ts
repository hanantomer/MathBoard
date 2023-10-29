import { CellCoordinates } from "common/globals";
import { NotationAttributes } from "common/baseTypes";
import { Application } from "@feathersjs/feathers";

import useFeathersHelper from "./feathersHelper";
const feathersHelper = useFeathersHelper();
let feathersClient: Application | null = null;

export default function userOutgoingOperations() {
  if (feathersClient == null) {
    feathersClient = feathersHelper.init();
  }

  // function signedInWithGoogle() {
  //   return (
  //     gapi.auth2.getAuthInstance() &&
  //     gapi.auth2.getAuthInstance().currentUser.get().isSignedIn()
  //   );
  // };

  function syncOutgoingActiveCell(activeCell: CellCoordinates) {
    if (!feathersHelper.isActive) return;
    feathersClient!
      .service("activeCell")
      .update(null, { activeCell: activeCell }, {})
      .then(() => {})
      .then((val: any) => {
        console.error("rejected:" + val);
      })
      .catch((error: any) => {
        console.error(error);
      });
  }

  function syncOutgoingAddNotation(notation: NotationAttributes) {
    if (!feathersHelper.isActive) return;
    feathersClient!.service("notationSync").create({ notation: notation }, {});
  }

  function syncOutgoingRemoveNotation(uuid: string) {
    if (!feathersHelper.isActive) return;
    feathersClient!.service("notationSync").remove(uuid, {});
  }

  function syncOutgoingUpdateNotation(selectedNotation: NotationAttributes) {
    if (!feathersHelper.isActive) return;
    feathersClient!
      .service("notationSync")
      .update(null, { notation: selectedNotation }, {});
  }

  function syncOutgoingHeartBeat(LessonUUId: string) {
    if (!feathersHelper.isActive) return;
    feathersClient!
      .service("heartbeat")
      .update(null, { LessonUUId: LessonUUId }, {});
  }
  // set student to be eligible to edit
  function syncOutgoingAuthUser(
    authorizedStudentUUId: string,
    revokedStudentUUId: string,
    LessonUUId: string,
  ) {
    if (!feathersHelper.isActive) return;
    if (authorizedStudentUUId)
      feathersClient!.service("authorization").update(
        null,
        {
          LessonUUId: LessonUUId,
          UserUUId: authorizedStudentUUId,
          authorized: true,
        },
        {},
      );
    if (revokedStudentUUId)
      feathersClient!.service("authorization").update(
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
