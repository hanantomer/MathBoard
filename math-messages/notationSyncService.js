class NotationSyncService {
  constructor() {
    this.notations = [];
  }
  async find(params) {
    return this.notations;
  }
  async get(data, params) {}
  async create(data, params) {
    console.debug(`notaion added:${data}`);
    this.notations.put(data);
  }
  async update(id, data, params) {}
  async patch(id, data, params) {}
  async remove(id, params) {}
  setup(app, path) {}
}

module.exports = NotationSyncService;
