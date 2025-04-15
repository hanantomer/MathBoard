import constants from "./constants";
import { Application } from "@feathersjs/feathers";
import { UserAttributes } from "../../math-common/src/userTypes";
import winston from "winston";

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
      filename: "authentication.log",
    }),
  ],
});

export default class AuthenticationService {
  app: any;
  lessonAdminConnection: Map<any, any>;
  lessonStudentConnection: Map<any, any>;

  constructor(app: Application) {
    this.app = app;
    this.lessonAdminConnection = new Map();
    this.lessonStudentConnection = new Map();
    logger.info(
      "Authentication service initialized"
    );
  }

  async create(
    userLesson: UserAttributes & {
      lessonUUId: string;
    },
    params: any
  ) {
    logger.info(
      `User ${userLesson.email} attempting to join lesson ${userLesson.lessonUUId}`
    );

    if (userLesson.userType === "TEACHER") {
      logger.info(
        `Processing teacher join request for ${userLesson.email}`
      );
      this.joinTeacher(
        params.connection,
        userLesson.uuid,
        userLesson.email,
        userLesson.lessonUUId
      );
    } else {
      logger.info(
        `Processing student join request for ${userLesson.email}`
      );
      this.joinStudent(
        params.connection,
        userLesson.uuid,
        userLesson.email,
        userLesson.lessonUUId
      );
    }

    this.app
      .channel(
        constants.LESSON_CHANNEL_PREFIX +
          userLesson.lessonUUId
      )
      .join(params.connection);
    logger.info(
      `User ${userLesson.email} joined lesson channel ${userLesson.lessonUUId}`
    );
  }

  async joinStudent(
    connection: any,
    userUUId: string,
    email: string,
    lessonUUId: string
  ) {
    logger.info(
      `Student ${email} joining lesson ${lessonUUId}`
    );

    if (
      !this.lessonStudentConnection.has(
        lessonUUId
      )
    ) {
      logger.debug(
        `Creating new student connection set for lesson ${lessonUUId}`
      );
      this.lessonStudentConnection.set(
        lessonUUId,
        new Set()
      );
    }

    this.lessonStudentConnection
      .get(lessonUUId)
      .add(userUUId);
    logger.debug(
      `Added student ${email} to lesson ${lessonUUId} connection set`
    );

    const studentChannel =
      constants.LESSON_CHANNEL_PREFIX +
      lessonUUId +
      constants.USER_CHANNEL_PREFIX +
      userUUId;
    this.app
      .channel(studentChannel)
      .join(connection);
    logger.info(
      `Student ${email} joined their individual channel in lesson ${lessonUUId}`
    );

    if (
      this.lessonAdminConnection.has(lessonUUId)
    ) {
      logger.info(
        `Connecting teacher to student ${email} channel in lesson ${lessonUUId}`
      );
      this.app
        .channel(studentChannel)
        .join(
          this.lessonAdminConnection.get(
            lessonUUId
          ).connection
        );
    }
  }

  async joinTeacher(
    connection: any,
    userUUId: string,
    email: string,
    lessonUUId: string
  ) {
    logger.info(
      `Teacher ${email} joining lesson ${lessonUUId}`
    );

    this.lessonAdminConnection.set(lessonUUId, {
      userUUId: userUUId,
      connection: connection,
    });
    logger.debug(
      `Stored teacher connection for lesson ${lessonUUId}`
    );

    if (
      this.lessonStudentConnection.has(lessonUUId)
    ) {
      logger.info(
        `Connecting teacher to existing student channels in lesson ${lessonUUId}`
      );
      this.lessonStudentConnection
        .get(lessonUUId)
        .forEach((student: number) => {
          const studentChannel =
            constants.LESSON_CHANNEL_PREFIX +
            lessonUUId +
            constants.USER_CHANNEL_PREFIX +
            student;
          this.app
            .channel(studentChannel)
            .join(connection);
          logger.debug(
            `Teacher ${email} joined student ${student} channel`
          );
        });
    }
  }
}
