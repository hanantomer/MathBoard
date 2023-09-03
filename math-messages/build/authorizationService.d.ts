import { Application } from "@feathersjs/feathers";
export default class AuhorizationService {
    app: Application;
    lessonAuthorizedUsers: number[][];
    constructor(app: Application);
    get(id: number, params: any): Promise<boolean | undefined>;
    update(id: number, data: any, params: any): Promise<any>;
}
