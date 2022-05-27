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
    userOperationsMixin_syncOutgoingCurrentPosition: async function (
      currentPosition
    ) {
      currentPosition.LessonId = this.lessonId;
      console.debug(`sync selected rect ${JSON.stringify(currentPosition)}`);
      client.service("currentPosition").update(
        null,
        { currentPosition: currentPosition },
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
    userOperationsMixin_syncOutgoingRemoveNotation: async function (notations) {
      client.service("notationSync").remove(
        { notations: [notations] },
        {
          query: {
            access_token: this.getAccessToken(),
          },
        }
      );
    },
    userOperationsMixin_syncOutgoingUpdateSelectedNotations: async function () {
      client.service("notationSync").update(
        { notations: this.getSelectedNotations() },
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
    mixin_syncIncomingUserOperations: async function (lessonId, isAdmin) {
      // this will route events from feathers
      await client.service("authentication").create({
        query: { access_token: this.getAccessToken(), lessonId: lessonId },
      });

      let _store = store;

      client.service("notationSync").on("updated", (notation) => {
        if (notation.UserId !== this.getUser().id) {
          _store.dispatch("syncIncomingUpdatedNotation", notation);
          //this.dispatchUpdateNotation(notation);
        }
      });
      client.service("notationSync").on("removed", (notations) => {
        notations.forEach((notation) => {
          if (notation.UserId !== this.getUser().id) {
            _store.dispatch("syncIncomingRemovedNotation", notation);
            //this.dispatchRomoveNotation(notation);
          }
        });
      });
      client.service("currentPosition").on("updated", (currentPosition) => {
        if (currentPosition.UserId !== this.getUser().id) {
          _store.dispatch("setCurrentRect", currentPosition);
        }
      });
      client.service("authorization").on("updated", (user) => {
        _store.dispatch("setUser", user);
      });
      if (isAdmin) {
        client.service("heartbeat").on("updated", (user) => {
          if (user.id !== this.getUser().id) {
            _store.dispatch("updateStudentHeartbeat", user);
          }
        });
      }
    },
  },
};
