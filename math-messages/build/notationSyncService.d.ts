export default class notationSyncService {
    app: any;
    constructor(app: any);
    enrichNotation(notation: any, userId: number): Promise<void>;
    create(data: any, params: any): Promise<any>;
    update(id: number, data: any, params: any): Promise<any>;
    remove(data: any, params: any): Promise<any>;
}
