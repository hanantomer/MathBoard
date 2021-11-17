const dbUtil = require("math-db/src/dbUtil");

class CursorSyncService {
  constructor(app) {
    this.app = app;
  }
  async update(id, data, params) {
    console.debug(
      `cusrsor position changed data: ${JSON.stringify(
        data
      )}, params: ${JSON.stringify(data)}`
    );

    let user = await this.app
      .service("authentication")
      .authUserByToken(params.query.access_token);

    if (!!user) {
      data.cursorPosition.userId = user.id;
      data.cursorPosition.exerciseId = await dbUtil.parseExerciseId(
        data.cursorPosition.exerciseId
      );

      console.debug(`cusrsor position changed: ${JSON.stringify(data)}`);
      return data.cursorPosition;
    }
  }
}
module.exports = CursorSyncService;
