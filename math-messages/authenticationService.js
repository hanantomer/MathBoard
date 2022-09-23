const authUtil = require("math-auth/src/authUtil");
const dbUtil = require("math-db/src/dbUtil");
const constants = require("./constants");

class AuthenticationService {
  constructor(app) {
    this.app = app;
    this.lessonAdminConnection = new Map(); // key lesson, value: userId/connection(1 only)
    this.lessonStudentConnection = new Map(); // key lesson, value: set where key:userId
  }

  async authUserByToken(access_token) {
    //    console.debug(`AuthenticationService-find access_token:${access_token}`);

    let user = await authUtil.authByLocalToken(access_token);
    if (!user) {
      console.error(
        `access_token:${access_token} not accociated with any user`
      );
      return;
    }
    return user;
  }

  // manage user login, join user to lesson or user channels
  async create(data, params) {
    let user = await this.authUserByToken(data.query.access_token);
    if (!user) {
      return;
    }

    let lessonId = await dbUtil.parseLessonId(data.query.lessonId);
    if (!lessonId) {
      return;
    }

    let isTeacher = await dbUtil.isTeacher(user.id, lessonId);

    if (isTeacher) {
      // store admin connection when she logs on
      this.lessonAdminConnection.set(lessonId, {
        userId: user.id,
        connection: params.connection,
      });
      // join admin to existing student channels
      if (this.lessonStudentConnection.has(lessonId)) {
        this.lessonStudentConnection.get(lessonId).forEach((student) => {
          // join admin to all student channels
          this.app
            .channel(
              constants.LESSON_CHANNEL_PREFIX +
                lessonId +
                constants.USER_CHANNEL_PREFIX +
                student
            )
            .join(params.connection);
          console.log(
            `subscribing admin: ${user.email} to student: ${student}`
          );
        });
      }
    } else {
      if (!this.lessonStudentConnection.has(lessonId)) {
        this.lessonStudentConnection.set(lessonId, new Set());
      }
      this.lessonStudentConnection.get(lessonId).add(user.id);

      // join studnet to student channel
      this.app
        .channel(
          constants.LESSON_CHANNEL_PREFIX +
            lessonId +
            constants.USER_CHANNEL_PREFIX +
            user.id
        )
        .join(params.connection);
      console.log(`subscribing student: ${user.email} to lesson: ${lessonId}`);

      // join admin to student channel
      if (this.lessonAdminConnection.has(lessonId)) {
        console.log(`subscribing admin: ${user.email} to student: ${user.id}`);
        this.app
          .channel(
            constants.LESSON_CHANNEL_PREFIX +
              lessonId +
              constants.USER_CHANNEL_PREFIX +
              user.id
          )
          .join(this.lessonAdminConnection.get(lessonId).connection);
      }
    }

    // either admin or student join lesson channel
    this.app
      .channel(constants.LESSON_CHANNEL_PREFIX + lessonId)
      .join(params.connection);
    console.log(`subscribing user: ${user.email} to lesson: ${lessonId}`);
  }
}

module.exports = AuthenticationService;
