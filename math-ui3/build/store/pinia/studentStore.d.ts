import { UserAttributes } from "common/userTypes";
export declare const useStudentStore: import("pinia").StoreDefinition<"studentanswer", import("pinia")._UnwrapAll<Pick<{
    getStudents: () => Map<String, UserAttributes>;
    getAuthorizedStudentUUId: () => import("vue").Ref<string>;
    setStudentHeartbeat: (uuid: string) => void;
    setAuthorizedStudentUUId: (authorizedStudentUUId: string) => string;
}, never>>, Pick<{
    getStudents: () => Map<String, UserAttributes>;
    getAuthorizedStudentUUId: () => import("vue").Ref<string>;
    setStudentHeartbeat: (uuid: string) => void;
    setAuthorizedStudentUUId: (authorizedStudentUUId: string) => string;
}, never>, Pick<{
    getStudents: () => Map<String, UserAttributes>;
    getAuthorizedStudentUUId: () => import("vue").Ref<string>;
    setStudentHeartbeat: (uuid: string) => void;
    setAuthorizedStudentUUId: (authorizedStudentUUId: string) => string;
}, "getStudents" | "getAuthorizedStudentUUId" | "setStudentHeartbeat" | "setAuthorizedStudentUUId">>;
