import io from "socket.io-client";
import feathers from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import store from "../store/index.js";

let socket = io("http://localhost:3030");
let client = feathers();
client.configure(socketio(socket));
let symbolCreateServcice = client.service("symbolSync");

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
    mixin_syncOutgoingSelectedRect: async function (selectedRect) {
      selectedRect.ExerciseId = this.exerciseId;
      console.debug(`sync selected rect ${JSON.stringify(selectedRect)}`);
      client.service("selectedRectSync").update(
        null,
        { selectedRect: selectedRect },
        {
          query: {
            access_token: this.getAccessToken(),
          },
        }
      );
    },
    mixin_syncOutgoingSymbolAdding: async function (symbol) {
      console.debug(`sync adding symbol ${JSON.stringify(symbol)}`);
      symbolCreateServcice.create(
        { symbol: symbol },
        {
          query: {
            access_token: this.getAccessToken(),
          },
        }
      );
    },
    mixin_syncOutgoingSymbolsDeletion: async function (symbol) {
      console.debug(`sync deleting symbol ${JSON.stringify(symbol)}`);
      client.service("symbolSync").remove(
        { symbol: symbol },
        {
          query: {
            access_token: this.getAccessToken(),
          },
        }
      );
    },
    mixin_sendHeartBeat: async function (exerciseId) {
      client.service("heartbeat").update(
        { ExerciseId: exerciseId },
        {
          query: {
            access_token: this.getAccessToken(),
          },
        }
      );
    },
    mixin_syncOutgoingUpdateSelectedSymbols: async function () {
      console.debug(`sync updating selected symbols`);
      client.service("symbolSync").update(
        { symbols: this.getSelectedSymbols() },
        {
          query: {
            access_token: this.getAccessToken(),
          },
        }
      );
    },

    mixin_syncOutgoingUserAthorization: async function (
      exerciseId,
      authorizedStudentId,
      revokedStudentId
    ) {
      if (authorizedStudentId)
        client.service("authorization").update(
          {
            authorization: {
              exerciseId: exerciseId,
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
              exerciseId: exerciseId,
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

    mixin_syncIncomingUserOperations: async function (exerciseId, isAdmin) {
      // this will route events from feathers
      await client.service("authentication").create({
        query: { access_token: this.getAccessToken(), exerciseId: exerciseId },
      });

      let _store = store;
      client.service("symbolSync").on("created", (symbol) => {
        _store.dispatch("syncIncomingAddedNotaion", symbol);
      });
      client.service("symbolSync").on("updated", (symbol) => {
        _store.dispatch("syncIncomingUpdatedNotaion", symbol);
      });
      client.service("symbolSync").on("removed", (symbol) => {
        _store.dispatch("syncIncomingDeletedNotaion", symbol);
      });
      client.service("selectedRectSync").on("updated", (selectedRect) => {
        _store.dispatch("setSelectedRect", selectedRect);
      });
      client.service("authorization").on("updated", (user) => {
        _store.dispatch("setUser", user);
      });
      if (isAdmin) {
        client.service("heartbeat").on("updated", (user) => {
          _store.dispatch("updateStudentHeartbeat", user);
        });
      }
    },
  },
};
