const dbUtil = require("math-db/src/dbUtil");

class currentPositionSyncService {
  constructor(app) {
    this.app = app;
  }
  async update(id, data, params) {
    let user = await this.app
      .service("authentication")
      .authUserByToken(params.query.access_token);

    if (!!user) {
      data.currentPosition.UserId = user.id;
      data.currentPosition.LessonId = await dbUtil.parseLessonId(
        data.currentPosition.LessonId
      );

      console.debug(
        `rect position changed: ${JSON.stringify(data.currentPosition)}`
      );
      return data.currentPosition;
    }
  }
}
module.exports = currentPositionSyncService;