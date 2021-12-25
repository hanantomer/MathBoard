const dbUtil = require("math-db/src/dbUtil");

class AuhorizationService {
  constructor(app) {
    this.app = app;
    this.exerciseAuthorizedUsers = [];
  }

  async get(data, params) {
    let user = await this.app
      .service("authentication")
      .authUserByToken(params.query.access_token);

    if (!!user) {
      user.ExerciseId = await dbUtil.parseExerciseId(data.ExerciseId);

      return (
        !!this.exerciseAuthorizedUsers[user.ExerciseId] &&
        this.exerciseAuthorizedUsers[user.ExerciseId].indexOf(user.id) >= 0
      );
    }
  }

  async update(data, params) {
    let user = await this.app
      .service("authentication")
      .authUserByToken(params.query.access_token);

    if (!!user) {
      user.exerciseId = await dbUtil.parseExerciseId(data.exerciseId);
    }

    let isOwner = !!user && dbUtil.isAdmin(user.id, user.exerciseId);
    if (isOwner) {
      if (!this.exerciseAuthorizedUsers[user.exerciseId])
        this.exerciseAuthorizedUsers[user.exerciseId] = [];

      if (!!user.authorization.write)
        this.exerciseAuthorizedUsers[user.exerciseId].push(user.id);
      else
        this.exerciseAuthorizedUsers[user.exerciseId].splice(
          this.exerciseAuthorizedUsers[user.exerciseId].indexOf(user.id),
          1
        );
      return user;
    }
  }
}
module.exports = AuhorizationService;
