const dbUtil = require("math-db/src/dbUtil");
class notationSyncService {
  constructor(app) {
    this.app = app;
  }

  async getUser(access_token) {
    return this.app.service("authentication").authUserByToken(access_token);
  }

  async create(data, params) {
    let user = await this.getUser(params.query.access_token);

    if (!!user) {
      data.notation.UserId = user.id;
      data.notation.ExerciseId = await dbUtil.parseExerciseId(
        data.notation.ExerciseId
      );
      return data.notation;
    }
    return null;
  }

  async update(data, params) {
    let user = await this.getUser(params.query.access_token);
    let exerciseId = null;
    if (!!user) {
      data.notations.forEach(async (notation) => {
        notation.UserId = user.id;
        if (exerciseId == null)
          exerciseId = await dbUtil.parseExerciseId(notation.ExerciseId);
        notation.ExerciseId = exerciseId;
      });
    }
    return data.notations;
  }

  async remove(data, params) {
    let user = await this.getUser(params.query.access_token);
    let exerciseId = null;
    if (!!user) {
      data.notation.UserId = user.id;
      if (exerciseId == null)
        exerciseId = await dbUtil.parseExerciseId(data.notation.ExerciseId);
      data.notation.ExerciseId = exerciseId;
    }
    return data.notation;
  }
}

module.exports = notationSyncService;
