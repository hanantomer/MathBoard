const dbUtil = require("math-db/src/dbUtil");
class notationSyncService {
  constructor(app) {
    this.app = app;
  }

  async enrichNotation(notation, userId) {
    if (!!notation) {
      notation.UserId = userId;
      let lessonId = await dbUtil.parseLessonId(notation.LessonId);
      notation.LessonId = lessonId;
    }
  }

  async getUser(access_token) {
    return this.app.service("authentication").authUserByToken(access_token);
  }

  async create(data, params) {
    let user = await this.getUser(params.query.access_token);
    if (!!user) {
      this.enrichNotation(data.notation, user.id);
    }
    return data.notation;
  }

  async update(data, params) {
    let user = await this.getUser(params.query.access_token);
    if (!!user) {
      this.enrichNotation(data.notation, user.id);
      return data.notation;
    }
  }

  async remove(data, params) {
    let user = await this.getUser(params.query.access_token);
    if (!!user) {
      this.enrichNotation(data.notation, user.id);
      return data.notation;
    }
  }
}

module.exports = notationSyncService;
