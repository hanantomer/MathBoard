export default class AuhorizationService {
    app: any;
    lessonAuthorizedUsers: number[][];
    constructor(app: any);
    get(id: number, data: any, params: any): Promise<boolean | undefined>;
    update(id: number, data: any, params: any): Promise<any>;
}
