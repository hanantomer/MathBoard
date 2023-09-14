import { UserAttributes } from "common/notationTypes";
export declare const useUserStore: import("pinia").StoreDefinition<"user", import("pinia")._UnwrapAll<Pick<{
    currentUser: UserAttributes;
    authorized: boolean;
    setUserWriteAuthorization: (isAauthorized: boolean) => void;
    isTeacher: () => boolean;
    setUser: (user: UserAttributes) => void;
    registerUser: (user: UserAttributes) => void;
}, "currentUser" | "authorized">>, Pick<{
    currentUser: UserAttributes;
    authorized: boolean;
    setUserWriteAuthorization: (isAauthorized: boolean) => void;
    isTeacher: () => boolean;
    setUser: (user: UserAttributes) => void;
    registerUser: (user: UserAttributes) => void;
}, never>, Pick<{
    currentUser: UserAttributes;
    authorized: boolean;
    setUserWriteAuthorization: (isAauthorized: boolean) => void;
    isTeacher: () => boolean;
    setUser: (user: UserAttributes) => void;
    registerUser: (user: UserAttributes) => void;
}, "setUserWriteAuthorization" | "isTeacher" | "setUser" | "registerUser">>;
