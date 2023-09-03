import util from "./util.js";
import { Application } from "@feathersjs/feathers";

class activeCellSyncService {
  app: Application;
  constructor(app: Application) {
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
