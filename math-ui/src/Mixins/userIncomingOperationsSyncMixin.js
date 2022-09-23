import io from "socket.io-client";
import feathers from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import store from "../store/index.js";

let socket = io("http://localhost:3030");
let client = feathers();
client.configure(socketio(socket));

export default {
  methods: {
    mixin_syncIncomingUserOperations: async function (lessonId, isTeacher) {
      // this will route events from feathers
      await client.service("authentication").create({
        query: { access_token: this.getAccessToken(), lessonId: lessonId },
      });

      let _store = store;

      client.service("notationSync").on("created", (notation) => {
        if (notation.UserId !== this.getUser().id) {
          _store.dispatch("syncIncomingUpdatedNotation", notation);
        }
      });

      client.service("notationSync").on("updated", (notation) => {
        if (notation.UserId !== this.getUser().id) {
          _store.dispatch("syncIncomingUpdatedNotation", notation);
        }
      });
      client.service("notationSync").on("removed", (notation) => {
        if (notation.UserId !== this.getUser().id) {
          _store.dispatch("syncIncomingRemovedNotation", notation);
        }
      });
      client.service("selectedPosition").on("updated", (selectedPosition) => {
        if (selectedPosition.UserId !== this.getUser().id) {
          _store.dispatch("setActiveRect", selectedPosition);
        }
      });
      client.service("authorization").on("updated", (user) => {
        _store.dispatch("setUser", user);
      });
      if (isTeacher) {
        client.service("heartbeat").on("updated", (user) => {
          if (user.id !== this.getUser().id) {
            _store.dispatch("updateStudentHeartbeat", user);
          }
        });
      }
    },
  },
};
