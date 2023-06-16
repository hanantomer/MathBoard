import io from "socket.io-client";
import feathers from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";

import {
  messagingHost,
} from "../../../math-common/src/globals";

export default function feathersHelper() {

  let client: any = {};

  function init() {
      let socket = io(messagingHost);
      client = feathers();
      client.configure(socketio(socket));
  };

  return {client}
};
