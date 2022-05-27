const dbUtil = require("math-db/src/dbUtil");

class AuhorizationService {
  constructor(app) {
    this.app = app;
    this.lessonAuthorizedUsers = [];
  }

  async get(data, params) {
    let user = await this.app
      .service("authentication")
      .authUserByToken(params.query.access_token);

    if (!!user) {
      user.lessonId = await dbUtil.parseLessonId(data.lessonId);

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
      user.lessonId = await dbUtil.parseLessonId(data.authorization.lessonId);
    }

    let isOwner =
      !!user && dbUtil.isAdmin(user.id, data.authorization.lessonId);
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
