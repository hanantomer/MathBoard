
class NotationSyncService {
  constructor() {
    this.notations = [];
  }
  async find(params) {
    return [];
  }
  async get(id, params) {}
  async create(data, params) {
    this.notations.put(data.id);
  }
  async update(id, data, params) {}
  async patch(id, data, params) {}
  async remove(id, params) {}
  setup(app, path) {}
}

module.exports = NotationSyncService;