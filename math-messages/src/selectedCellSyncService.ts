import util from "./util.js";
import { Application } from "@feathersjs/feathers";
import { SelectedCell } from "../../math-common/build/baseTypes";

class selectedCellSyncService {
  app: Application;
  constructor(app: Application) {
    this.app = app;
  }
  async update(id: number, data: SelectedCell, params: any) {
    let user = await util.getUserFromCookie(
      params.headers.cookie,
      this.app
    );

    if (user?.id) {
      data.userUUId = user.uuid;

      console.debug(
        `rect position changed: ${JSON.stringify(
          data
        )}`
      );
      return data;
    }
  }
}
export default selectedCellSyncService;
