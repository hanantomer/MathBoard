export default class AuthUtils {
    userCache: Map<any, any>;
    static userCache: any;
    static authByLocalPassword(email: string, password: string): Promise<any>;
    static authByLocalToken(access_token: string): Promise<any>;
    static authByGoogleToken(access_token: string): Promise<any>;
}
