import { feathers, Application } from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import io from "socket.io-client";

//import { messagingHost } from "../../../math-common/src/globals";
export default function feathersHelper() {
  const isActive = true;

  function init(): Application {
    const app = feathers();
    if (isActive) {
      const socket = io("/msg");
      app.configure(socketio(socket));
    }
    return app;
  }

  return { init, isActive };
}
