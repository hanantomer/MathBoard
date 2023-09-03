import { Application } from "@feathersjs/feathers";
export default class AuthenticationService {
    app: any;
    lessonAdminConnection: Map<any, any>;
    lessonStudentConnection: Map<any, any>;
    constructor(app: Application);
    get(id: number, params: any): Promise<any>;
    create(data: any, params: any): Promise<void>;
}
