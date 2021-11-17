const authUtil = require("math-auth/src/authUtil");
const dbUtil = require("math-db/src/dbUtil");
class AuthenticationService {
  constructor(app) {
    this.app = app;
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

    this.app.channel("channel" + exerciseId).join(params.connection);
    console.log(`subscribing user: ${user.email} to exercise: ${exerciseId}`);
  }
}

module.exports = AuthenticationService;
