const dbUtil = require("math-db/src/dbUtil");
const util = require("./util");

class HeartbeatService {
  constructor(app) {
    this.app = app;
  }
  async update(id, data, params) {
    let access_token = await util.getAccessTokenFromCookie(
      params.headers.cookie
    );

    let user = await this.app
      .service("authentication")
      .authUserByToken(access_token);

    if (!!user) {
      return {
        LessonUUId: data.LessonUUId,
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    }
  }
}
module.exports = HeartbeatService;
