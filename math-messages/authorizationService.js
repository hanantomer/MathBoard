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
      .authUserByToken(params.authorization.access_token);

    let lessonId = null;
    if (!!user) {
      lessonId = await dbUtil.getIdByUUID(
        "Lesson",
        params.authorization.LessonUUId
      );
    }

    let isOwner = !!user && dbUtil.isTeacher(user.id, lessonId);
    if (isOwner) {
      return {
        userId: params.authorization.student,
        LessonUUId: params.authorization.LessonUUId,
        authorized: params.authorization.authorized,
      };
    }
  }
}
module.exports = AuhorizationService;
