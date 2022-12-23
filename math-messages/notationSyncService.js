const dbUtil = require("math-db/src/dbUtil");
const util = require("./util.js");
class notationSyncService {
  constructor(app) {
    this.app = app;
  }

  async enrichNotation(notation, userId) {
    if (!!notation) {
      notation.UserId = userId;

      let lessonId = await dbUtil.getIdByUUID("Lesson", notation.LessonUUId);
      notation.LessonId = lessonId;
    }
  }

  async create(data, params) {
    let user = await util.getUserFromCookie(params.headers.cookie, this.app);
    if (!!user) {
      this.enrichNotation(data.notation, user.id);
    }
    return data.notation;
  }

  async update(data, params) {
    let user = await util.getUserFromCookie(params.headers.cookie, this.app);
    if (!!user) {
      this.enrichNotation(data.notation, user.id);
      return data.notation;
    }
  }

  async remove(data, params) {
    let user = await util.getUserFromCookie(params.headers.cookie, this.app);
    if (!!user) {
      this.enrichNotation(data.notation, user.id);
      return data.notation;
    }
  }
}

module.exports = notationSyncService;
