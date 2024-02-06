import util from "./util.js";
import { Application } from "@feathersjs/feathers";
import { ColorizedCell } from "../../math-common/build/baseTypes";

class colorizedCellSyncService {
  app: Application;
  constructor(app: Application) {
    this.app = app;
  }
  async update(
    id: number,
    data: ColorizedCell,
    params: any
  ) {
    let user = await util.getUserFromCookie(
      params.headers.cookie
    );

    if (user?.id) {
      data.userUUId = user.uuid;
      return data;
    }
  }
}
export default colorizedCellSyncService;
