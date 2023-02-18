const util = require("./util.js");

class activeCellSyncService {
  constructor(app) {
    this.app = app;
  }
  async update(id, data, params) {
    let user = await util.getUserFromCookie(params.headers.cookie, this.app);

    if (!!user) {
      data.activeCell.UserId = user.id;

      console.debug(
        `rect position changed: ${JSON.stringify(data.activeCell)}`
      );
      return data.activeCell;
    }
  }
}
module.exports = activeCellSyncService;
