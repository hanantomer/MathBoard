import { feathers, Application } from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import io from "socket.io-client";

import { useUserStore } from "../store/pinia/userStore";
import { useLessonStore } from "../store/pinia/lessonStore";


export class FeathersHelper {
  private static instance: Application;
  private static socket: ReturnType<typeof io>;
  /** When set, connect/reconnect joins the lesson channel for mobile upload. */
  private static mobileLessonUUId?: string;

  private static joinLessonChannels(): void {
    if (!this.instance || !this.socket?.connected) return;

    if (this.mobileLessonUUId) {
      this.instance.service("imageLoaded").create({
        lessonUUId: this.mobileLessonUUId,
      });
      return;
    }
    const lessonStore = useLessonStore();
    const userStore = useUserStore();
    const user = userStore.getCurrentUser();
    const lesson = lessonStore.getCurrentLesson();
    if (!user || !lesson?.uuid) return;

    this.instance.service("authentication").create({
      ...user,
      lessonUUId: lesson.uuid,
    });
  }

  public static getInstance(
    _userUUId?: string,
    lessonUUId?: string,
  ): Application {
    if (lessonUUId) {
      this.mobileLessonUUId = lessonUUId;
    }

    if (!this.instance) {
      this.instance = feathers();
      this.socket = io();

      const onSocketReady = () => {
        console.log("[Feathers] Connected to messaging server");
        this.joinLessonChannels();
      };

      this.socket.on("connect", onSocketReady);
      this.socket.on("reconnect", onSocketReady);

      this.socket.on("disconnect", () => {
        console.warn("[Feathers] Disconnected from messaging server");
      });

      this.socket.on("connect_error", (error: Error) => {
        console.error("[Feathers] Connection error:", error.message);
      });

      this.instance.configure(socketio(this.socket));
    }

    return this.instance;
  }

  public static isConnected(): boolean {
    return !!this.socket?.connected;
  }

  public static waitUntilConnected(timeoutMs = 15000): Promise<void> {
    this.getInstance();

    if (this.socket.connected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        this.socket.off("connect", onConnect);
        reject(new Error("Messaging server connection timed out"));
      }, timeoutMs);

      const onConnect = () => {
        window.clearTimeout(timer);
        this.socket.off("connect", onConnect);
        resolve();
      };

      this.socket.once("connect", onConnect);
    });
  }

  /** Ensures this client is subscribed to the lesson channel for image upload events. */
  public static async ensureLessonChannel(lessonUUId: string): Promise<void> {
    await this.waitUntilConnected();
    await this.getInstance().service("imageLoaded").create({ lessonUUId });
  }

  public static disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.mobileLessonUUId = undefined;
  }
}
