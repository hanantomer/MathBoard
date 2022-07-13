const dbUtil = require("math-db/src/dbUtil");

class selectedPositionSyncService {
  constructor(app) {
    this.app = app;
  }
  async update(id, data, params) {
    let user = await this.app
      .service("authentication")
      .authUserByToken(params.query.access_token);

    if (!!user) {
      data.selectedPosition.UserId = user.id;
      data.selectedPosition.LessonId = await dbUtil.parseLessonId(
        data.selectedPosition.LessonId
      );

      console.debug(
        `rect position changed: ${JSON.stringify(data.selectedPosition)}`
      );
      return data.selectedPosition;
    }
  }
}
module.exports = selectedPositionSyncService;
