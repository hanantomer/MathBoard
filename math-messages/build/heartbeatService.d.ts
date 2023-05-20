export default class HeartbeatService {
    app: any;
    constructor(app: any);
    update(id: number, data: any, params: any): Promise<{
        LessonUUId: any;
        userId: any;
        firstName: any;
        lastName: any;
    } | undefined>;
}
