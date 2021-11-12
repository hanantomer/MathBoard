const authUtil = require("math-auth/src/authUtil");
const dbUtil = require("math-db/src/dbUtil");
class AuthenticationService {
  constructor(app) {
    this.app = app;
  }
  async find(params) {
    console.debug(
      `AuthenticationService-find access_token:${params.query.access_token}, exerciseId: ${params.query.exerciseId}`
    );

    let user = await authUtil.authByLocalToken(params.query.access_token);

    if (!user) {
      console.error(
        `access_token:${params.query.access_token} not accociated with any user`
      );
      return;
    }

    let accessLink = await dbUtil.getExerciseId(params.query.exerciseId);

    if (!accessLink) {
      console.error(
        `accessLink:${params.query.access_token} not found,exerciseId unknown`
      );
      return;
    }

    this.app.channel("channel" + accessLink.ExerciseId).join(params.connection);
  }
  async get(data, params) {}
  async create(data, params) {}
  async update(id, data, params) {}
  async patch(id, data, params) {}
  async remove(id, params) {}
  setup(app, path) {}
}

module.exports = AuthenticationService;
