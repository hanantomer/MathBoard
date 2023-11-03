import { feathers, Application } from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import io from "socket.io-client";

//import { messagingHost } from "../../../math-common/src/globals";
export class FeathersHelper {

  private constructor() { };

  private static instance : Application;

  public static getInstance() {
    if (!this.instance) {
        this.instance = feathers();
        const socket = io();
        this.instance.configure(socketio(socket));
    }
    return this.instance;
  }
}
