import useAuthUtil from "../../math-auth/build/authUtil";
import useDbUtil from "../../math-db/build/dbUtil";
import util from "./util";
import constants from "./constants";

const authUtil = useAuthUtil();
const dbUtil = useDbUtil();
import feathers, { Application } from "@feathersjs/feathers";
import { UserAttributes } from "../../math-common/src/userTypes";

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
      // store admin connection when she logs on
      this.lessonAdminConnection.set(
        data.lessonUUId,
        {
          userUUId: user.uuid,
          connection: params.connection,
        }
      );

      // join teacher to existing student channels
      if (
        this.lessonStudentConnection.has(
          data.lessonUUId
        )
      ) {
        this.lessonStudentConnection
          .get(data.lessonUUId)
          .forEach((student: number) => {
            // join admin to all student channels
            this.app
              .channel(
                constants.LESSON_CHANNEL_PREFIX +
                  data.lessonUUId +
                  constants.USER_CHANNEL_PREFIX +
                  student
              )
              .join(params.connection);
            console.log(
              `subscribing admin: ${user?.email} to student: ${student}`
            );
          });
      }
    } else {
      if (
        !this.lessonStudentConnection.has(
          data.lessonUUId
        )
      ) {
        this.lessonStudentConnection.set(
          data.lessonUUId,
          new Set()
        );
      }
      this.lessonStudentConnection
        .get(data.lessonUUId)
        .add(user.uuid);

      // join studnet to student channel
      this.app
        .channel(
          constants.LESSON_CHANNEL_PREFIX +
            data.lessonUUId +
            constants.USER_CHANNEL_PREFIX +
            user.uuid
        )
        .join(params.connection);
      console.log(
        `subscribing student: ${user.email} to lesson: ${data.lessonUUId}`
      );

      // join admin to student channel
      if (
        this.lessonAdminConnection.has(
          data.lessonUUId
        )
      ) {
        console.log(
          `subscribing admin: ${user.email} to student: ${user.id}`
        );
        this.app
          .channel(
            constants.LESSON_CHANNEL_PREFIX +
              data.lessonUUId +
              constants.USER_CHANNEL_PREFIX +
              user.uuid
          )
          .join(
            this.lessonAdminConnection.get(
              data.lessonUUId
            ).connection
          );
      }
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
}

