const dbUtil = require("math-db/src/dbUtil");
class NotationSyncService {
  constructor(app) {
    this.app = app;
  }

  async create(data, params) {
    let user = await this.app
      .service("authentication")
      .authUserByToken(params.query.access_token);

    if (!!user) {
      data.notation.UserId = user.id;
      data.notation.ExerciseId = await dbUtil.parseExerciseId(
        data.notation.ExerciseId
      );
      console.debug(`notaion added:${JSON.stringify(data.notation)}`);
    }

    return data.notation;
  }
}

module.exports = NotationSyncService;
