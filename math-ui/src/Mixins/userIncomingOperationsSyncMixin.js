import io from "socket.io-client";
import feathers from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import store from "../store/index.js";

export default {
  methods: {
    mixin_syncIncomingUserOperations: async function () {
      let socket = io("http://localhost:3030");
      let client = feathers();
      client.configure(socketio(socket));
      // this will route events from feathers
      await client.service("authentication").create({
        LessonUUId: this.getCurrentLesson().uuid,
      });

      let _store = store;

      client.service("notationSync").on("created", (notation) => {
        if (notation.userId !== this.getUser().id) {
          _store.dispatch("syncIncomingUpdatedNotation", notation);
        }
      });

      client.service("notationSync").on("updated", (notation) => {
        if (notation.userId !== this.getUser().id) {
          _store.dispatch("syncIncomingUpdatedNotation", notation);
        }
      });
      client.service("notationSync").on("removed", (notation) => {
        if (notation.userId !== this.getUser().id) {
          _store.dispatch("syncIncomingRemovedNotation", notation);
        }
      });
      client.service("activeCell").on("updated", (activeCell) => {
        if (activeCell.userId !== this.getUser().id) {
          _store.dispatch("setActiveCell", activeCell);
        }
      });
      client.service("authorization").on("updated", (user) => {
        _store.dispatch("setUser", user);
      });
      if (this.isTeacher()) {
        client.service("heartbeat").on("updated", (user) => {
          if (user.id !== this.getUser().id) {
            _store.dispatch("updateStudentHeartbeat", user);
          }
        });
      }
    },
  },
};
