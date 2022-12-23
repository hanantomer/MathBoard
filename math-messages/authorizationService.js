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

  async update(data, params) {
    let user = await this.app
      .service("authentication")
      .authUserByToken(params.query.access_token);

    if (!!user) {
      user.lessonId = await dbUtil.getIdByUUID(
        "lesson",
        data.authorization.LessonUUId
      );
    }

    let isOwner =
      !!user && dbUtil.isTeacher(user.id, data.authorization.lessonId);
    if (isOwner) {
      return {
        userId: data.authorization.student,
        lessonId: user.lessonId,
        authorized: data.authorization.authorized,
      };
    }
  }
}
module.exports = AuhorizationService;
