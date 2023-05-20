export default class AuthenticationService {
    app: any;
    lessonAdminConnection: Map<any, any>;
    lessonStudentConnection: Map<any, any>;
    constructor(app: any);
    authUserByToken(access_token: string): Promise<any>;
    create(data: any, params: any): Promise<void>;
}
