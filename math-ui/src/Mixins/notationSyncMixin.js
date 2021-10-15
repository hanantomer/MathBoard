import io from "socket.io-client";
import feathers from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import { mapActions } from "vuex";

export default {
  methods: {
    signedInWithGoogle: function () {
      return gapi.auth2.getAuthInstance().currentUser.get().isSignedIn();
    },
    syncIncomingNotation: function (exerciseId) {
      const token = `${
        this.signedInWithGoogle
          ? gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse()
              .id_token
          : this.$cookies.get("token")
      }`;

      let socket = io("http://localhost:3030", {
        query: { token: token },
      });
      let client = feathers();
      let notaionSync = {};
      //socket.close();
      client.configure(socketio(socket));
      notaionSync = client.service("notationSync");
      notaionSync.on("created", (notation) => {
        mapActions.syncIncomingNotaion(notation);
      });
    },
  },
};
