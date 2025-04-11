import { Application } from "@feathersjs/feathers";
import { SelectedCell } from "../../math-common/build/baseTypes";

class selectedCellSyncService {
  app: Application;
  constructor(app: Application) {
    this.app = app;
  }
  async update(
    id: number,
    data: any,
    params: any
  ) {
    // let user = await util.getUserFromCookie(
    //   params.headers.cookie
    // );

    //if (user?.id) {
    //data.userUUId = data.;
    return data;
    //}
  }
}
export default selectedCellSyncService;
