
import { CellCoordinates } from "common/globals";
import { NotationAttributes } from "common/baseTypes";
import { useNotationStore } from "../store/pinia/notationStore";

import useFeathersHelper from "./feathersHelper";
const notationStore = useNotationStore();
const feathersHelper = useFeathersHelper();

export default function userOutgoingOperations() {

    const feathersClient = feathersHelper.init();

    ///TODO - watch internal notation mutations and dsiaptch to other users
    notationStore.$subscribe((mutation, state) => {
      console.log("a change happened");
      console.log(mutation, state);
    });

    // function signedInWithGoogle() {
    //   return (
    //     gapi.auth2.getAuthInstance() &&
    //     gapi.auth2.getAuthInstance().currentUser.get().isSignedIn()
    //   );
    // };

  function syncOutgoingActiveCell (activeCell: CellCoordinates) {
      feathersClient
        .service("activeCell")
        .update(null, { activeCell: activeCell }, {});
  };

  function syncOutgoingSaveNotation(notation: NotationAttributes) {
    feathersClient.service("notationSync").create({ notation: notation }, {});
  };

  function syncOutgoingRemoveNotation(uuid: string) {
    feathersClient.service("notationSync").remove( uuid , {});
  };

  function syncOutgoingUpdateSelectedNotation(selectedNotation: NotationAttributes) {
    feathersClient
      .service("notationSync")
      .update(null, { notation: selectedNotation }, {});
  };

  function syncOutgoingHeartBeat(LessonUUId: string) {
      feathersClient
        .service("heartbeat")
        .update(null, { LessonUUId: LessonUUId }, {});
  };
    // inform students that he is eligible to edit
  function syncOutgoingAuthUser (
      authorizedStudentUUId : string,
      revokedStudentUUId: string,
      LessonUUId: string
    ) {
      if (authorizedStudentUUId)
        feathersClient.service("authorization").update(
          null,
          {
            LessonUUId: LessonUUId,
            UserUUId: authorizedStudentUUId,
            authorized: true,
          },
          {}
        );
      if (revokedStudentUUId)
        feathersClient.service("authorization").update(
          null,
          {
            LessonUUId: LessonUUId,
            userUUId: revokedStudentUUId,
            authorized: false,
          },
          {}
        );
  };

  return {
    syncOutgoingUpdateSelectedNotation,
    syncOutgoingActiveCell,
    syncOutgoingAuthUser,
    syncOutgoingHeartBeat,
    syncOutgoingRemoveNotation,
    syncOutgoingSaveNotation,
  };
};
