import { Application } from "@feathersjs/feathers";
export default class notationSyncService {
    app: Application;
    constructor(app: Application);
    enrichNotation(notation: any, userId: number): Promise<void>;
    create(data: any, params: any): Promise<any>;
    update(id: number, data: any, params: any): Promise<any>;
    remove(data: any, params: any): Promise<any>;
}
