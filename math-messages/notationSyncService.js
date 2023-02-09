const dbUtil = require("math-db/src/dbUtil");
const util = require("./util.js");
class notationSyncService {
  constructor(app) {
    this.app = app;
  }

  async enrichNotation(notation, userId) {
    if (!!notation) {
      notation.UserId = userId;
    }
  }

  async create(data, params) {
    let user = await util.getUserFromCookie(params.headers.cookie, this.app);
    if (!!user) {
      this.enrichNotation(data.notation.data, user.id);
    }
    return data.notation;
  }

  async update(data, params) {
    let user = await util.getUserFromCookie(params.headers.cookie, this.app);
    if (!!user) {
      this.enrichNotation(data.notation.data, user.id);
      return data.notation;
    }
  }

  async remove(data, params) {
    let user = await util.getUserFromCookie(params.headers.cookie, this.app);
    if (!!user) {
      this.enrichNotation(data.notation.data, user.id);
      return data.notation;
    }
  }
}

module.exports = notationSyncService;
