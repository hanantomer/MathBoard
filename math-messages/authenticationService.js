const authUtil = require("math-auth/src/authUtil");
const dbUtil = require("math-db/src/dbUtil");
const constants = require("./constants");

class AuthenticationService {
  constructor(app) {
    this.app = app;
    this.exerciseAdminConnection = new Map(); // key exercise, value: userId/connection(1 only)
    this.exerciseStudentConnection = new Map(); // key exercise, value: set where key:userId
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

  // manage user login, join user to exercise or user channels
  async create(data, params) {
    let user = await this.authUserByToken(data.query.access_token);
    if (!user) {
      return;
    }

    let exerciseId = await dbUtil.parseExerciseId(data.query.exerciseId);
    if (!exerciseId) {
      return;
    }

    let isAdmin = await dbUtil.isAdmin(user.id, exerciseId);

    if (isAdmin) {
      // store admin connection when she logs on
      this.exerciseAdminConnection.set(exerciseId, {
        userId: user.id,
        connection: params.connection,
      });
      // join admin to existing student channels
      if (this.exerciseStudentConnection.has(exerciseId)) {
        this.exerciseStudentConnection.get(exerciseId).forEach((student) => {
          // join admin to all student channels
          this.app
            .channel(
              constants.EXERCISE_CHANNEL_PREFIX +
                exerciseId +
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
      if (!this.exerciseStudentConnection.has(exerciseId)) {
        this.exerciseStudentConnection.set(exerciseId, new Set());
      }
      this.exerciseStudentConnection.get(exerciseId).add(user.id);

      // join studnet to student channel
      this.app
        .channel(
          constants.EXERCISE_CHANNEL_PREFIX +
            exerciseId +
            constants.USER_CHANNEL_PREFIX +
            user.id
        )
        .join(params.connection);
      console.log(
        `subscribing student: ${user.email} to exercise: ${exerciseId}`
      );

      // join admin to student channel
      if (this.exerciseAdminConnection.has(exerciseId)) {
        console.log(`subscribing admin: ${user.email} to student: ${user.id}`);
        this.app
          .channel(
            constants.EXERCISE_CHANNEL_PREFIX +
              exerciseId +
              constants.USER_CHANNEL_PREFIX +
              user.id
          )
          .join(this.exerciseAdminConnection.get(exerciseId).connection);
      }
    }

    // either admin or student join exercise channel
    this.app
      .channel(constants.EXERCISE_CHANNEL_PREFIX + exerciseId)
      .join(params.connection);
    console.log(`subscribing user: ${user.email} to exercise: ${exerciseId}`);
  }
}

module.exports = AuthenticationService;
