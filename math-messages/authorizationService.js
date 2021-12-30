const dbUtil = require("math-db/src/dbUtil");

class AuhorizationService {
  constructor(app) {
    this.app = app;
    this.exerciseAuthorizedUsers = [];
  }

  async get(data, params) {
    let user = await this.app
      .service("authentication")
      .authUserByToken(params.query.access_token);

    if (!!user) {
      user.exerciseId = await dbUtil.parseExerciseId(data.exerciseId);

      return (
        !!this.exerciseAuthorizedUsers[user.exerciseId] &&
        this.exerciseAuthorizedUsers[user.exerciseId].indexOf(user.id) >= 0
      );
    }
  }

  async update(data, params) {
    let user = await this.app
      .service("authentication")
      .authUserByToken(params.query.access_token);

    if (!!user) {
      user.exerciseId = await dbUtil.parseExerciseId(
        data.authorization.exerciseId
      );
    }

    let isOwner =
      !!user && dbUtil.isAdmin(user.id, data.authorization.exerciseId);
    if (isOwner) {
      return {
        userId: data.authorization.student,
        exerciseId: data.authorization.exerciseId,
        authorized: data.authorization.authorized,
      };
    }
  }
}
module.exports = AuhorizationService;
