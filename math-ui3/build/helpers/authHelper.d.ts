import { UesrType } from "common/enum";
import { UserAttributes } from "common/userTypes";
export default function useAuthHelper(): {
    setUser: (user: UserAttributes) => void;
    registerUser: (firstName: string, lastName: string, password: string, email: string, userType: UesrType) => void;
    authLocalUserByToken: () => Promise<UserAttributes | undefined>;
    authLocalUserByUserAndPassword: (email: string, password: string) => Promise<UserAttributes | null>;
    signOut: () => Promise<void>;
    signedInLocally: () => string | undefined;
    signedInWithGoogle: () => boolean;
    getToken: () => string;
    authGoogleUser: () => Promise<UserAttributes>;
    canEdit: () => boolean;
};
