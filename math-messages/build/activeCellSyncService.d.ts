import { Application } from "@feathersjs/feathers";
declare class activeCellSyncService {
    app: Application;
    constructor(app: Application);
    update(id: number, data: any, params: any): Promise<any>;
}
export default activeCellSyncService;
