import io from "socket.io-client";
import feathers from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import store from "../store/index.js";
import { mapGetters } from "vuex";

export default {
  methods: {
    ...mapGetters({
      getUser: "getUser",
      getParent: "getParent",
    }),
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
        if (
          notation.UserId !== this.getUser().id &&
          this.getParent().boardType === "lesson"
        ) {
          _store.dispatch("syncIncomingUpdatedNotation", notation);
        }
      });

      client.service("notationSync").on("updated", (notation) => {
        if (
          notation.UserId !== this.getUser().id &&
          this.getParent().boardType === "lesson"
        ) {
          _store.dispatch("syncIncomingUpdatedNotation", notation);
        }
      });
      client.service("notationSync").on("removed", (notation) => {
        if (
          notation.UserId !== this.getUser().id &&
          this.getParent().boardType === "lesson"
        ) {
          _store.dispatch("syncIncomingRemovedNotation", notation);
        }
      });
      client.service("activeCell").on("updated", (activeCell) => {
        if (
          activeCell.UserId !== this.getUser().id &&
          this.getParent().boardType === "lesson"
        ) {
          _store.dispatch("setActiveCell", activeCell);
        }
      });
      if (!this.isTeacher()) {
        client.service("authorization").on("updated", (authData) => {
          if (
            authData.UserId === this.getUser().id &&
            this.getCurrentLesson().uuid === authData.LessonUUId
          ) {
            _store.dispatch("setUserWriteAuthorization", authData.authorized);
          }
        });
      }
      if (this.isTeacher()) {
        client.service("heartbeat").on("updated", (user) => {
          if (
            user.id !== this.getUser().id &&
            this.getParent().boardType === "lesson"
          ) {
            _store.dispatch("updateStudentHeartbeat", user);
          }
        });
      }
    },
  },
};
