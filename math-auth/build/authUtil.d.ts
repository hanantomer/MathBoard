export default class AuthUtils {
    userCache: Map<any, any>;
    authByLocalPassword(email: string, password: string): Promise<any>;
    authByLocalToken(access_token: string): Promise<any>;
    authByGoogleToken(access_token: string): Promise<any>;
}
