const dbUtil = require("math-db/src/dbUtil");
class SymbolSyncService {
  constructor(app) {
    this.app = app;
  }

  async getUser(access_token) {
    return this.app.service("authentication").authUserByToken(access_token);
  }

  async create(data, params) {
    let user = await this.getUser(params.query.access_token);

    if (!!user) {
      data.symbol.UserId = user.id;
      data.symbol.ExerciseId = await dbUtil.parseExerciseId(
        data.symbol.ExerciseId
      );
      console.debug(`notaion added:${JSON.stringify(data.symbol)}`);
      return data.symbol;
    }
    return null;
  }

  async update(data, params) {
    let user = await this.getUser(params.query.access_token);
    let exerciseId = null;
    if (!!user) {
      data.symbols.forEach(async (symbol) => {
        symbol.UserId = user.id;
        if (exerciseId == null)
          exerciseId = await dbUtil.parseExerciseId(symbol.ExerciseId);
        symbol.ExerciseId = exerciseId;
        console.debug(`notaion updated:${JSON.stringify(symbol)}`);
      });
    }
    return data.symbols;
  }

  async remove(data, params) {
    let user = await this.getUser(params.query.access_token);
    let exerciseId = null;
    if (!!user) {
      //data.symbols.forEach(async (symbol) => {
      data.symbol.UserId = user.id;
      if (exerciseId == null)
        exerciseId = await dbUtil.parseExerciseId(data.symbol.ExerciseId);
      data.symbol.ExerciseId = exerciseId;
      console.debug(`symbol deleted:${JSON.stringify(data.symbol)}`);
      //});
    }
    return data.symbol;
  }
}

module.exports = SymbolSyncService;
