const dbUtil = require("math-db/src/dbUtil");

class CursorSyncService {
  constructor(app) {
    this.app = app;
  }
  async update(id, data, params) {
    console.debug(
      `cusrsor position changed data: ${JSON.stringify(
        data
      )}, params: ${JSON.stringify(params)}`
    );

    let user = await this.app
      .service("authentication")
      .authUserByToken(params.query.access_token);

    if (!!user) {
      data.cursorPosition.UserId = user.id;
      data.cursorPosition.ExerciseId = await dbUtil.parseExerciseId(
        data.cursorPosition.ExerciseId
      );

      console.debug(`cusrsor position changed: ${JSON.stringify(data)}`);
      return data.cursorPosition;
    }
  }
}
module.exports = CursorSyncService;
