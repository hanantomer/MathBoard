const dbUtil = require("math-db/src/dbUtil");
const util = require("./util.js");
class AuhorizationService {
  constructor(app) {
    this.app = app;
    this.lessonAuthorizedUsers = [];
  }

  async get(id, data, params) {
    let user = await util.getUserFromCookie(params.headers.cookie, this.app);

    if (!!user) {
      user.lessonId = await dbUtil.getIdByUUID("Lesson", data.LessonUUId);

      return (
        !!this.lessonAuthorizedUsers[user.lessonId] &&
        this.lessonAuthorizedUsers[user.lessonId].indexOf(user.id) >= 0
      );
    }
  }

  async update(id, data, params) {
    let user = await util.getUserFromCookie(params.headers.cookie, this.app);
    let lessonId = await dbUtil.getIdByUUID("Lesson", data.LessonUUId);
    let isTeacher = await dbUtil.isTeacher(user.id, lessonId);
    if (!isTeacher) return;

    return data;
  }
}

module.exports = AuhorizationService;
