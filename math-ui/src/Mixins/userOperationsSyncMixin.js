import io from "socket.io-client";
import feathers from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import store from "../store/index.js";

let socket = io("http://localhost:3030");
let client = feathers();
client.configure(socketio(socket));
let notationCreateServcice = client.service("notationSync");

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
    mixin_syncOutgoingCursorPosition: async function (cursorPosition) {
      console.debug(`sync cursor position ${JSON.stringify(cursorPosition)}`);
      client.service("cursorSync").update(
        null,
        { cursorPosition: cursorPosition },
        {
          query: {
            access_token: this.getAccessToken(),
          },
        }
      );
    },
    mixin_syncOutgoingSymbolAdding: async function (symbol) {
      console.debug(`sync adding symbol ${JSON.stringify(symbol)}`);
      notationCreateServcice.create(
        { notation: symbol },
        {
          query: {
            access_token: this.getAccessToken(),
          },
        }
      );
    },
    mixin_syncOutgoingSymbolsDeletion: async function (symbols) {
      console.debug(`sync deleting symbols ${JSON.stringify(symbols)}`);
      client.service("notationSync").remove(
        { notations: symbols },
        {
          query: {
            access_token: this.getAccessToken(),
          },
        }
      );
    },
    mixin_syncOutgoingUpdateSelectedNotations: async function () {
      console.debug(`sync updating selected symbols`);
      client.service("notationSync").update(
        { notations: this.getSelectedNotations() },
        {
          query: {
            access_token: this.getAccessToken(),
          },
        }
      );
    },
    mixin_syncIncomingUserOperations: async function (exerciseId) {
      // this will route events from feathers
      await client.service("authentication").create({
        query: { access_token: this.getAccessToken(), exerciseId: exerciseId },
      });

      let _store = store;
      client.service("notationSync").on("created", (notation) => {
        _store.dispatch("syncIncomingAddedNotaion", notation);
      });
      client.service("notationSync").on("updated", (notation) => {
        _store.dispatch("syncIncomingUpdatedNotaion", notation);
      });
      client.service("notationSync").on("removed", (notation) => {
        _store.dispatch("syncIncomingDeletedNotaion", notation);
      });
      client.service("cursorSync").on("updated", (cursorPosition) => {
        _store.dispatch("setCursorPosition", cursorPosition);
      });
    },
  },
};
