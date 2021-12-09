const dbUtil = require("math-db/src/dbUtil");
class NotationSyncService {
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
      console.debug(`notaion added:${JSON.stringify(data.notation)}`);
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
        console.debug(`notaion updated:${JSON.stringify(notation)}`);
      });
    }
    return data.notations;
  }

  async remove(data, params) {
    let user = await this.getUser(params.query.access_token);
    let exerciseId = null;
    if (!!user) {
      data.notations.forEach(async (notation) => {
        notation.UserId = user.id;
        if (exerciseId == null)
          exerciseId = await dbUtil.parseExerciseId(notation.ExerciseId);
        notation.ExerciseId = exerciseId;
        console.debug(`notaion deleted:${JSON.stringify(notation)}`);
      });
    }
    return data.notations;
  }
}

module.exports = NotationSyncService;
