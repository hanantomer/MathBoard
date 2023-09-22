import { UserAttributes, UserCreationAttributes } from "common/userTypes";
export declare const useUserStore: import("pinia").StoreDefinition<"user", import("pinia")._UnwrapAll<Pick<{
    getCurrentUser: () => UserAttributes;
    getAuthorized: () => boolean;
    setAuthorized: (authorized: boolean) => boolean;
    isTeacher: () => boolean;
    setCurrentUser: (user: UserAttributes) => void;
    registerUser: (user: UserCreationAttributes) => void;
}, never>>, Pick<{
    getCurrentUser: () => UserAttributes;
    getAuthorized: () => boolean;
    setAuthorized: (authorized: boolean) => boolean;
    isTeacher: () => boolean;
    setCurrentUser: (user: UserAttributes) => void;
    registerUser: (user: UserCreationAttributes) => void;
}, never>, Pick<{
    getCurrentUser: () => UserAttributes;
    getAuthorized: () => boolean;
    setAuthorized: (authorized: boolean) => boolean;
    isTeacher: () => boolean;
    setCurrentUser: (user: UserAttributes) => void;
    registerUser: (user: UserCreationAttributes) => void;
}, "getCurrentUser" | "getAuthorized" | "setAuthorized" | "isTeacher" | "setCurrentUser" | "registerUser">>;
