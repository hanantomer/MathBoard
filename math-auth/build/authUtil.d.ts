import User from "../../math-db/build/models/user.model";
import { UserAttributes } from "../../math-common/build/notationTypes";
export default function useAuthUtils(): {
    authByLocalPassword: (email: string, password: string) => Promise<UserAttributes | null>;
    authByGoogleToken: (access_token: string) => Promise<User | null | undefined>;
    authByLocalToken: (access_token: string) => Promise<UserAttributes | undefined>;
};
