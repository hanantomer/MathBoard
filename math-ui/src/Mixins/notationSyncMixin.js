import io from "socket.io-client";
import feathers from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import store from "../store/index.js";

export default {
  methods: {
    signedInWithGoogle: function () {
      return gapi.auth2.getAuthInstance().currentUser.get().isSignedIn();
    },
    syncIncomingNotation: function (exerciseId) {
      const access_token = `${
        this.signedInWithGoogle()
          ? gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse()
              .id_token
          : this.$cookies.get("access_token")
      }`;

      let socket = io("http://localhost:3030");
      let client = feathers();
      //socket.close();
      client.configure(socketio(socket));

      //access_token
      let authenticationService = client.service("authentication");
      authenticationService.find({
        query: { access_token: access_token, exerciseId: exerciseId },
      });

      let _store = store;
      let notaionSync = client.service("notationSync");
      notaionSync.on("created", (notation) => {
        _store.dispatch("syncIncomingNotaion", notation);
      });
    },
  },
};
