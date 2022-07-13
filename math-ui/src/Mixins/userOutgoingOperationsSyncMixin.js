import io from "socket.io-client";
import feathers from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import store from "../store/index.js";

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
      return `${
        this.signedInWithGoogle()
          ? gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse()
              .id_token
          : window.$cookies.get("access_token")
      }`;
    },
    userOperationsMixin_syncOutgoingSelectedPosition: async function (
      selectedPosition
    ) {
      selectedPosition.LessonId = this.lessonId;
      console.debug(`sync selected rect ${JSON.stringify(selectedPosition)}`);
      client.service("selectedPosition").update(
        null,
        { selectedPosition: selectedPosition },
        {
          query: {
            access_token: this.getAccessToken(),
          },
        }
      );
    },
    userOperationsMixin_syncOutgoingSaveNotation: async function (notation) {
      client.service("notationSync").create(
        { notation: notation },
        {
          query: {
            access_token: this.getAccessToken(),
          },
        }
      );
    },
    userOperationsMixin_syncOutgoingRemoveNotation: async function (notation) {
      client.service("notationSync").remove(
        { notation: notation },
        {
          query: {
            access_token: this.getAccessToken(),
          },
        }
      );
    },
    userOperationsMixin_syncOutgoingUpdateSelectedNotation: async function (
      selectedNotation
    ) {
      client.service("notationSync").update(
        { notation: selectedNotation },
        {
          query: {
            access_token: this.getAccessToken(),
          },
        }
      );
    },
    userOperationsMixin_syncOutgoingHeartBeat: async function (lessonId) {
      client.service("heartbeat").update(
        { LessonId: lessonId },
        {
          query: {
            access_token: this.getAccessToken(),
          },
        }
      );
    },
    userOperationsMixin_syncOutgoingAuthUser: async function (
      lessonId,
      authorizedStudentId,
      revokedStudentId
    ) {
      if (authorizedStudentId)
        client.service("authorization").update(
          {
            authorization: {
              lessonId: lessonId,
              student: authorizedStudentId,
              authorized: true,
            },
          },
          {
            query: {
              access_token: this.getAccessToken(),
            },
          }
        );
      if (revokedStudentId)
        client.service("authorization").update(
          {
            authorization: {
              lessonId: lessonId,
              student: revokedStudentId,
              authorized: false,
            },
          },
          {
            query: {
              access_token: this.getAccessToken(),
            },
          }
        );
    },
  },
};
