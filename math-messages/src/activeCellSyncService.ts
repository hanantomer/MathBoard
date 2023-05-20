import util from "./util.js";

class activeCellSyncService {
  app: any;
  constructor(app: any) {
    this.app = app;
  }
  async update(id: number, data: any, params: any) {
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
export default activeCellSyncService;
