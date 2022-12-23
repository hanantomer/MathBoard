import io from "socket.io-client";
import feathers from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";

let socket = io("http://localhost:3030");
let client = feathers();
client.configure(socketio(socket));

export default {
  methods: {
    signedInWithGoogle: function () {
      return (
        gapi.auth2.getAuthInstance() &&
        gapi.auth2.getAuthInstance().currentUser.get().isSignedIn()
      );
    },
    getAccessToken() {
      // return `${
      //   this.signedInWithGoogle()
      //     ? gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse()
      //         .id_token
      //     : window.$cookies.get("access_token")
      // }`;
      return window.$cookies.get("access_token");
    },
    userOperationsMixin_syncOutgoingActiveCell: async function (activeCell) {
      activeCell.LessonUUId = this.getCurrentLesson().uuid;
      console.debug(`sync selected rect ${JSON.stringify(activeCell)}`);
      client.service("activeCell").update({}, { activeCell: activeCell }, {});
    },
    userOperationsMixin_syncOutgoingSaveNotation: async function (notation) {
      client.service("notationSync").create({ notation: notation }, {});
    },
    userOperationsMixin_syncOutgoingRemoveNotation: async function (notation) {
      client.service("notationSync").remove({}, { notation: notation }, {});
    },
    userOperationsMixin_syncOutgoingUpdateSelectedNotation: async function (
      selectedNotation
    ) {
      client
        .service("notationSync")
        .update({}, { notation: selectedNotation }, {});
    },
    userOperationsMixin_syncOutgoingHeartBeat: async function (LessonUUId) {
      client.service("heartbeat").update({}, { LessonUUId: LessonUUId }, {});
    },
    userOperationsMixin_syncOutgoingAuthUser: async function (
      authorizedStudentId,
      revokedStudentId
    ) {
      if (authorizedStudentId)
        client.service("authorization").update(
          {},
          {
            authorization: {
              LessonUUId: this.getCurrentLesson().uuid,
              student: authorizedStudentId,
              authorized: true,
            },
          },
          {}
        );
      if (revokedStudentId)
        client.service("authorization").update(
          {},
          {
            authorization: {
              LessonUUId: this.getCurrentLesson().uuid,
              student: revokedStudentId,
              authorized: false,
            },
          },
          {}
        );
    },
  },
};
