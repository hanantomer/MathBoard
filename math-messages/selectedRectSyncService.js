const dbUtil = require("math-db/src/dbUtil");

class rectSyncService {
  constructor(app) {
    this.app = app;
  }
  async update(id, data, params) {
    let user = await this.app
      .service("authentication")
      .authUserByToken(params.query.access_token);

    if (!!user) {
      data.selectedRect.UserId = user.id;
      data.selectedRect.ExerciseId = await dbUtil.parseExerciseId(
        data.selectedRect.ExerciseId
      );

      console.debug(
        `rect position changed: ${JSON.stringify(data.selectedRect)}`
      );
      return data.selectedRect;
    }
  }
}
module.exports = rectSyncService;
