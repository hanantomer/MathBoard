const dbUtil = require("math-db/src/dbUtil");

class HeartbeatService {
  constructor(app) {
    this.app = app;
  }
  async update(data, params) {
    let user = await this.app
      .service("authentication")
      .authUserByToken(params.query.access_token);

    if (!!user) {
      let lessonId = await dbUtil.parseLessonId(data.LessonId);
      return {
        lessonId: lessonId,
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    }
  }
}
module.exports = HeartbeatService;
