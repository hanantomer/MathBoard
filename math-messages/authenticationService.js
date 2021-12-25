const authUtil = require("math-auth/src/authUtil");
const dbUtil = require("math-db/src/dbUtil");
class AuthenticationService {
  constructor(app) {
    this.app = app;
    this.exerciseAdminConnection = new Map();
  }

  async authUserByToken(access_token) {
    console.debug(`AuthenticationService-find access_token:${access_token}`);

    let user = await authUtil.authByLocalToken(access_token);
    if (!user) {
      console.error(
        `access_token:${access_token} not accociated with any user`
      );
      return;
    }
    return user;
  }

  async create(data, params) {
    let user = await this.authUserByToken(data.query.access_token);
    if (!user) {
      return;
    }

    let exerciseId = await dbUtil.parseExerciseId(data.query.exerciseId);
    if (!exerciseId) {
      return;
    }

    // store admin connection when she logs on
    let isAdmin = await dbUtil.isAdmin(user.id, exerciseId);
    if (isAdmin) {
      this.exerciseAdminConnection.set(exerciseId, {
        userId: user.id,
        connection: params.connection,
      });
    }
    // join admin to student channel
    if (this.exerciseAdminConnection.get(exerciseId).userId != user.id) {
      console.log(`subscribing admin: ${user.email} to student: ${user.id}`);
      this.app
        .channel("studentchannel" + user.id)
        .join(this.exerciseAdminConnection.get(exerciseId).connection);
    }

    if (!isAdmin) {
      this.app.channel("studentchannel" + user.id).join(params.connection);
      console.log(
        `subscribing student: ${user.email} to exercise: ${exerciseId}`
      );
    }

    this.app.channel("channel" + exerciseId).join(params.connection);
    console.log(`subscribing user: ${user.email} to exercise: ${exerciseId}`);
  }
}

module.exports = AuthenticationService;
