import useAuthUtil from "../../math-auth/build/authUtil";
import useDbUtil from "../../math-db/build/dbUtil";
import util from "./util";
import constants from "./constants";

const authUtil = useAuthUtil();
import { Application } from "@feathersjs/feathers";

export default class AuthenticationService {
  app: any;
  lessonAdminConnection: Map<any, any>;
  lessonStudentConnection: Map<any, any>;
  constructor(app: Application) {
    this.app = app;
    this.lessonAdminConnection = new Map(); // key lesson, value: userUUId/connection(1 only)
    this.lessonStudentConnection = new Map(); // key lesson, value: set where key:userUUId
  }

  async get(access_token: string) {
    let user: any =
      await authUtil.authByLocalToken(
        access_token
      );
    if (!user) {
      console.error(
        `access_token:${access_token} not accociated with any user`
      );
      return;
    }
    return user;
  }

  // manage user login, join user to lesson or user channels
  async create(data: any, params: any) {
    let user = await util.getUserFromCookie(
      params.headers.cookie
    );

    if (!user) {
      return;
    }

    if (!data.lessonUUId) {
      return;
    }

    if (user.userType === "TEACHER") {
      this.joinTeacher(
        params.connection,
        user.uuid,
        user.email,
        data.lessonUUId
      );
    } else {
      this.joinStudent(
        params.connection,
        user.uuid,
        user.email,
        data.lessonUUId
      );
    }

    // either teacher or student join lesson channel
    this.app
      .channel(
        constants.LESSON_CHANNEL_PREFIX +
          data.lessonUUId
      )
      .join(params.connection);
    console.log(
      `subscribing user: ${user.email} to lesson: ${data.lessonUUId}`
    );
  }

  async joinStudent(
    connection: any,
    userUUId: string,
    email: string,
    lessonUUId: string
  ) {
    if (
      !this.lessonStudentConnection.has(
        lessonUUId
      )
    ) {
      this.lessonStudentConnection.set(
        lessonUUId,
        new Set()
      );
    }
    this.lessonStudentConnection
      .get(lessonUUId)
      .add(userUUId);

    // join studnet to student channel
    this.app
      .channel(
        constants.LESSON_CHANNEL_PREFIX +
          lessonUUId +
          constants.USER_CHANNEL_PREFIX +
          userUUId
      )
      .join(connection);
    console.log(
      `subscribing student: ${email} to lesson: ${lessonUUId}`
    );

    // join teacher to student channel
    if (
      this.lessonAdminConnection.has(
        lessonUUId
      )
    ) {
      console.log(
        `subscribing admin: ${email} to student: ${userUUId}`
      );
      this.app
        .channel(
          constants.LESSON_CHANNEL_PREFIX +
            lessonUUId +
            constants.USER_CHANNEL_PREFIX +
            userUUId
        )
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
    // store admin connection when she logs on
    this.lessonAdminConnection.set(lessonUUId, {
      userUUId: userUUId,
      connection: connection,
    });

    // join teacher to existing student channels
    if (
      this.lessonStudentConnection.has(lessonUUId)
    ) {
      this.lessonStudentConnection
        .get(lessonUUId)
        .forEach((student: number) => {
          // join admin to all student channels
          this.app
            .channel(
              constants.LESSON_CHANNEL_PREFIX +
                lessonUUId +
                constants.USER_CHANNEL_PREFIX +
                student
            )
            .join(connection);
          console.log(
            `subscribing admin: ${email} to student: ${student}`
          );
        });
    }
  }
}

