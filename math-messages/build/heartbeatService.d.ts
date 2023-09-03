import { Application } from "@feathersjs/feathers";
export default class HeartbeatService {
    app: Application;
    constructor(app: Application);
    update(id: number, data: any, params: any): Promise<{
        LessonUUId: any;
        userId: any;
        firstName: any;
        lastName: any;
    } | undefined>;
}
