declare class activeCellSyncService {
    app: any;
    constructor(app: any);
    update(id: number, data: any, params: any): Promise<any>;
}
export default activeCellSyncService;
