import { feathers, Application } from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import io from "socket.io-client";

import { messagingHost } from "../../../math-common/src/globals";
export default function feathersHelper() {

  function init(): Application {
    const socket = io(messagingHost);
    const app = feathers();
    app.configure(socketio(socket));
    return app;
  };

  return { init }
};
