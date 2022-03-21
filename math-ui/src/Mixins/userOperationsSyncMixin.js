import io from "socket.io-client";
import feathers from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import store from "../store/index.js";

let socket = io("http://localhost:3030");
let client = feathers();
client.configure(socketio(socket));

export default {
  methods: {
    dispatchCreatedNotation(notation, store) {
      switch (notation.type) {
        case "Symbol": {
          store.dispatch("syncIncomingAddedSymbol", notation);
          break;
        }
        case "Fraction": {
          store.dispatch("syncIncomingAddedFraction", notation);
          break;
        }
      }
    },
    dispatchUpdatedNotation(notation, store) {
      switch ((notation.type, store)) {
        case "Symbol": {
          store.dispatch("syncIncomingUpdatedSymbol", notation);
          break;
        }
        case "Fraction": {
          store.dispatch("syncIncomingUpdatedFraction", notation);
          break;
        }
      }
    },
    dispatchRemoveNotation(notation, store) {
      switch ((notation.type, store)) {
        case "Symbol": {
          store.dispatch("syncIncomingRemoveSymbol", notation);
          break;
        }
        case "Fraction": {
          store.dispatch("syncIncomingRemoveFraction", notation);
          break;
        }
      }
    },
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
      currentPosition.ExerciseId = this.exerciseId;
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
      client.service("notationSync").update(
        { notations: [notation] },
        {
          query: {
            access_token: this.getAccessToken(),
          },
        }
      );
    },
    userOperationsMixin_syncOutgoingRemoveNotation: async function (notation) {
      client.service("notationSync").remove(
        { notations: [notation] },
        {
          query: {
            access_token: this.getAccessToken(),
          },
        }
      );
    },
    userOperationsMixin_syncOutgoingUpdateSelectedNotations: async function () {
      client.service("notationSync").update(
        { notations: this.getSelectedSymbols() },
        {
          query: {
            access_token: this.getAccessToken(),
          },
        }
      );
    },
    userOperationsMixin_syncOutgoingHeartBeat: async function (exerciseId) {
      client.service("heartbeat").update(
        { ExerciseId: exerciseId },
        {
          query: {
            access_token: this.getAccessToken(),
          },
        }
      );
    },

    mixin_syncOutgoingAuthUser: async function (
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

      client.service("notationSync").on("updated", (notation) => {
        if (notation.UserId !== this.getUser().id) {
          this.dispatchUpdateNotation(notation);
        }
      });
      client.service("notationSync").on("removed", (notation) => {
        if (notation.UserId !== this.getUser().id) {
          this.dispatchRomoveNotation(notation);
        }
      });
      client.service("currentPosition").on("updated", (currentPosition) => {
        currentPosition.type === "rect"
          ? _store.dispatch("setCurrentRect", currentPosition)
          : _store.dispatch("setCurrentFraction", currentPosition);
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
