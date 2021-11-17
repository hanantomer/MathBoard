const dbUtil = require("math-db/src/dbUtil");
class NotationSyncService {
  async find(params) {
    return this.notations;
  }
  async get(data, params) {}
  async create(data, params) {
    data.ExerciseId = await dbUtil.parseExerciseId(data.ExerciseId);
    console.debug(`notaion added:${JSON.stringify(data)}`);
    return data;
  }
  async update(id, data, params) {}
  async patch(id, data, params) {}
  async remove(id, params) {}
  setup(app, path) {}
}

module.exports = NotationSyncService;
