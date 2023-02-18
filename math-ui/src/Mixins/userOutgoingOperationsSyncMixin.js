import io from "socket.io-client";
import feathers from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";

export default {
  data: function () {
    return {
      client: null,
    };
  },
  methods: {
    userOperationsMixin_init: function () {
      let socket = io("http://localhost:3030");
      window.feathers_client = feathers();
      window.feathers_client.configure(socketio(socket));
    },
    signedInWithGoogle: function () {
      return (
        gapi.auth2.getAuthInstance() &&
        gapi.auth2.getAuthInstance().currentUser.get().isSignedIn()
      );
    },
    userOperationsMixin_syncOutgoingActiveCell: async function (activeCell) {
      activeCell.LessonUUId = this.getCurrentLesson().uuid;
      window.feathers_client
        .service("activeCell")
        .update({}, { activeCell: activeCell }, {});
    },
    userOperationsMixin_syncOutgoingSaveNotation: async function (notation) {
      window.feathers_client
        .service("notationSync")
        .create({ notation: notation }, {});
    },
    userOperationsMixin_syncOutgoingRemoveNotation: async function (notation) {
      window.feathers_client
        .service("notationSync")
        .remove({ notation: notation }, {});
    },
    userOperationsMixin_syncOutgoingUpdateSelectedNotation: async function (
      selectedNotation
    ) {
      window.feathers_client
        .service("notationSync")
        .update({}, { notation: selectedNotation }, {});
    },
    userOperationsMixin_syncOutgoingHeartBeat: async function (LessonUUId) {
      window.feathers_client
        .service("heartbeat")
        .update({}, { LessonUUId: LessonUUId }, {});
    },
    // inform students that he is eligible to edit
    userOperationsMixin_syncOutgoingAuthUser: async function (
      authorizedStudentId,
      revokedStudentId,
      LessonUUId
    ) {
      if (authorizedStudentId)
        window.feathers_client.service("authorization").update(
          {},
          {
            LessonUUId: LessonUUId,
            userId: authorizedStudentId,
            authorized: true,
          },
          {}
        );
      if (revokedStudentId)
        window.feathers_client.service("authorization").update(
          {},
          {
            LessonUUId: LessonUUId,
            userId: revokedStudentId,
            authorized: false,
          },
          {}
        );
    },
  },
};
