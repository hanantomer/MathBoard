import { Application } from "@feathersjs/feathers";

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
    return data;
  }
}
export default selectedCellSyncService;
