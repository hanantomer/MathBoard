import { feathers, Application } from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import io from "socket.io-client";

import { useUserStore } from "../store/pinia/userStore";
import { useLessonStore } from "../store/pinia/lessonStore";

const lessonStore = useLessonStore();
const userStore = useUserStore();

export class FeathersHelper {
  private constructor() {}

  private static instance: Application;

  public static getInstance(
    userUUId?: string, ///TOD:verify user validity
    lessonUUId?: string,
  ): Application {
    if (!this.instance) {
      this.instance = feathers();
      const socket = io();

      socket.on("connect", () => {
        console.log("Connected to server");
        if (userUUId && lessonUUId) {
          this.instance.service("imageLoaded").create({
            lessonUUId: lessonUUId,
          });
        } else {
          this.instance.service("authentication").create({
            ...userStore.getCurrentUser(),
            lessonUUId: lessonStore.getCurrentLesson()!.uuid,
          });
        }
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from server");
      });

      socket.on("error", (error: any) => {
        console.error("Socket error:", error);
      });

      socket.on("reconnect", (attemptNumber: number) => {
        console.log("Reconnected to server after", attemptNumber, "attempts");
      });

      socket.on("reconnect_attempt", (attemptNumber: number) => {
        console.log(
          "Attempting to reconnect to server, attempt number:",
          attemptNumber,
        );
      });

      socket.on("connect_error", (error: string) => {
        console.error("Connection error:", error);
      });

      socket.on("connect_timeout", (timeout: number) => {
        console.error("Connection tsctimeout:", timeout);
      });

      socket.on("reconnect_error", (error: string) => {
        console.error("Reconnection error:", error);
      });

      socket.on("reconnect_failed", () => {
        console.error("Failed to reconnect to server");
      });

      socket.on("ping", () => {
        console.log("Ping received from server");
      });

      socket.on("pong", (latency: number) => {
        console.log("Pong received from server, latency:", latency);
      });

      this.instance.configure(socketio(socket));
    }
    return this.instance;
  }

}
