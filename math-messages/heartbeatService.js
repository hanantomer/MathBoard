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
      let exerciseId = await dbUtil.parseExerciseId(data.ExerciseId);
      return {
        exerciseId: exerciseId,
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    }
  }
}
module.exports = HeartbeatService;
