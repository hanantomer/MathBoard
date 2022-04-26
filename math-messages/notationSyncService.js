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
      data.notation.LessonId = await dbUtil.parseLessonId(
        data.notation.LessonId
      );
    }
    return data.notation;
  }

  async update(data, params) {
    let user = await this.getUser(params.query.access_token);
    let lessonId = null;
    if (!!user) {
      data.notations.forEach(async (notation) => {
        notation.UserId = user.id;
        if (lessonId == null)
          lessonId = await dbUtil.parseLessonId(notation.LessonId);
        notation.LessonId = lessonId;
      });
    }
    return data.notations;
  }

  async remove(data, params) {
    let user = await this.getUser(params.query.access_token);
    if (!!user) {
      data.notations.forEach((notation) => {
        notation.UserId = user.id;
      });
    }
    return data.notations;
  }
}

module.exports = notationSyncService;
