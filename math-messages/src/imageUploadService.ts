import { Application } from "@feathersjs/feathers";
import winston from "winston";
import path from "path";
import constants from "./constants";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    }),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(__dirname, "logs", "upload.log"),
    }),
  ],
});

export default class imageUploadService {
  app: any;

  constructor(app: Application) {
    this.app = app;
  }

  async create(data: { lessonUUId?: string }, params: any) {
    if (!data?.lessonUUId) {
      logger.warn("imageLoaded.create: missing lessonUUId");
      throw new Error("lessonUUId is required");
    }
    if (!params?.connection) {
      logger.warn(
        `imageLoaded.create: no connection for lesson ${data.lessonUUId}`,
      );
      throw new Error("No socket connection");
    }

    const channelName =
      constants.LESSON_CHANNEL_PREFIX + data.lessonUUId;
    this.app.channel(channelName).join(params.connection);
    logger.info(
      `Connection joined lesson channel ${channelName} for image upload`,
    );
    return { lessonUUId: data.lessonUUId };
  }

  async update(_id: number, data: { lessonUUId?: string; base64?: string }) {
    if (!data?.lessonUUId) {
      logger.warn("imageLoaded.update: missing lessonUUId");
      throw new Error("lessonUUId is required");
    }
    if (!data?.base64) {
      logger.warn(
        `imageLoaded.update: missing base64 for lesson ${data.lessonUUId}`,
      );
      throw new Error("base64 image data is required");
    }

    const payloadSizeKb = Math.round(
      (data.base64.length * 3) / 4 / 1024,
    );
    logger.info(
      `imageLoaded.update: lesson ${data.lessonUUId}, ~${payloadSizeKb} KB`,
    );

    return {
      lessonUUId: data.lessonUUId,
      base64: data.base64,
    };
  }
}
