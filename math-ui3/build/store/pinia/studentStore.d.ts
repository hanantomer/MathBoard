import { UserAttributes } from "common/notationTypes";
export declare const useStudentStore: import("pinia").StoreDefinition<"studentanswer", import("pinia")._UnwrapAll<Pick<{
    students: Map<String, UserAttributes>;
    authorizedStudentUUId: import("vue").Ref<string>;
    setStudentHeartbeat: (uuid: string) => void;
}, "students" | "authorizedStudentUUId">>, Pick<{
    students: Map<String, UserAttributes>;
    authorizedStudentUUId: import("vue").Ref<string>;
    setStudentHeartbeat: (uuid: string) => void;
}, never>, Pick<{
    students: Map<String, UserAttributes>;
    authorizedStudentUUId: import("vue").Ref<string>;
    setStudentHeartbeat: (uuid: string) => void;
}, "setStudentHeartbeat">>;
