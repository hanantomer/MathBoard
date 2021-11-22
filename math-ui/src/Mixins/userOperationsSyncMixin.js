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
    syncOutgoingCursorPosition: async function (cursorPosition) {
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
    syncOutgoingSymbolAdding: async function (symbol) {
      console.debug(`sync adding symbol ${JSON.stringify(symbol)}`);
      client.service("notationSync").create(
        { notation: symbol },
        {
          query: {
            access_token: this.getAccessToken(),
          },
        }
      );
    },

    syncIncomingUserOperations: async function (userId, exerciseId) {
      await client.service("authentication").create({
        query: { access_token: this.getAccessToken(), exerciseId: exerciseId },
      });

      let _store = store;
      let _userId = userId;
      client.service("notationSync").on("created", (notation) => {
        // don't sync self added notation
        //if (notation.UserId != _userId) {
        store.dispatch("syncIncomingNotaion", notation);
        //}
      });
      client.service("cursorSync").on("updated", (cursorPosition) => {
        // don't sync self added notation
        //if (cursorPosition.UserId != _userId) {
        _store.dispatch("setCursorPosition", cursorPosition);
        //}
      });
    },
  },
};
