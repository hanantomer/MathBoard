import util from "./util";
import { Application } from "@feathersjs/feathers";
import winston from "winston";
import path from "path";
import constants from "./constants";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
      }
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(__dirname, "upload.log"),
    }),
  ],
});


export default class imageUploadService {
  app: any;
  constructor(app: Application) {
    this.app = app;
  }

  async create(lessonUUId: string, params: any) {
    this.app.channel(
        constants.LESSON_CHANNEL_PREFIX +
        lessonUUId
      )
      .join(params.connection);    
    logger.debug(
      `lesson ${lessonUUId} joined channel for image upload`
    );
  }

  // server sends image uploaded message to make client add it
  
  async update(
    id: number,
    data: any,
    params: any
  ) {
    return {
      lessonUUId: data.lessonUUId,
      base64: data.base64,
      width: data.width,
      height: data.height,
    };
  }
}

