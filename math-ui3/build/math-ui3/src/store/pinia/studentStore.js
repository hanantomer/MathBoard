import { defineStore } from "pinia";
import { reactive, ref } from "vue";
export const useStudentStore = defineStore("studentanswer", () => {
    let students = reactive({});
    let authorizedStudentUUId = ref("");
    function setStudentHeartbeat(uuid) {
        let student = students.get(uuid);
        if (student) {
            student.lastHeartbeatTime = new Date();
        }
    }
    ;
    function toggleAuthorization(userUUId) {
        authorizedStudentUUId.value = userUUId;
    }
    ;
    return {
        students,
        authorizedStudentUUId,
        setStudentHeartbeat,
    };
});
//# sourceMappingURL=studentStore.js.map