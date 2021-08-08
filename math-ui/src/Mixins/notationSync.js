import io from "socket.io-client";
import feathers from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import { mapActions } from "vuex";

const socket = io("http://localhost:3030");
const client = feathers();
client.configure(socketio(socket));
const notaionSync = client.service("notaionSync");

module.exports = {
    syncNotationIn: function () {
    notaionSync.on("created", (notation) => {
        
    }),
  syncNotationOut: function (id) {
    notaionSync.create({
      id:id,
    });
  },
};
