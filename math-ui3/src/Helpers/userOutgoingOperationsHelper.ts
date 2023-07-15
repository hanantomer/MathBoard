
import {  CellCoordinates } from "../../../math-common/src/globals";
import { Notation } from "./responseTypes";
import { useNotationStore } from "../store/pinia/notationStore";

import useFeathersHelper from "./feathersHelper";
const { client } = useFeathersHelper();
const notationStore = useNotationStore();

export default function userOutgoingOperations() {

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
      //activeCell.LessonUUId = this.getCurrentLesson().uuid;
      client
        .service("activeCell")
        .update({}, { activeCell: activeCell }, {});
  };

  function syncOutgoingSaveNotation(notation: Notation) {
      client
        .service("notationSync")
        .create({ notation: notation }, {});
  };

  function syncOutgoingRemoveNotation(notation: Notation) {
      client
        .service("notationSync")
        .remove({ notation: notation }, {});
  };

  function syncOutgoingUpdateSelectedNotation (selectedNotation: Notation)
     {
      client
        .service("notationSync")
        .update({}, { notation: selectedNotation }, {});
  };

  function syncOutgoingHeartBeat(LessonUUId: string) {
      client
        .service("heartbeat")
        .update({}, { LessonUUId: LessonUUId }, {});
  };
    // inform students that he is eligible to edit
  function syncOutgoingAuthUser (
      authorizedStudentUUId : string,
      revokedStudentUUId: string,
      LessonUUId: string
    ) {
      if (authorizedStudentUUId)
        client.service("authorization").update(
          {},
          {
            LessonUUId: LessonUUId,
            UserUUId: authorizedStudentUUId,
            authorized: true,
          },
          {}
        );
      if (revokedStudentUUId)
        client.service("authorization").update(
          {},
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
