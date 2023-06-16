
import {  PointCoordinates } from "../../../math-common/src/globals";
import { Notation } from "./responseTypes";

import useFeathersHelper from "./feathersHelper";
const { client } = useFeathersHelper();

export default function userOutgoingOperations() {


    // function signedInWithGoogle() {
    //   return (
    //     gapi.auth2.getAuthInstance() &&
    //     gapi.auth2.getAuthInstance().currentUser.get().isSignedIn()
    //   );
    // };

   function syncOutgoingActiveCell (activeCell: PointCoordinates) {
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

  function _syncOutgoingHeartBeat(LessonUUId: string) {
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

  return {}
};
