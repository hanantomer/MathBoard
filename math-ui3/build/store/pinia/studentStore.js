import { defineStore } from "pinia";
import { reactive, ref } from "vue";
export const useStudentStore = defineStore("studentanswer", () => {
    let students = reactive({});
    let authorizedStudentUUId = ref("");
    function getStudents() {
        return students;
    }
    function getAuthorizedStudentUUId() {
        return authorizedStudentUUId;
    }
    function setStudentHeartbeat(uuid) {
        let student = students.get(uuid);
        if (student) {
            student.lastHeartbeatTime = new Date();
        }
    }
    ;
    function setAuthorizedStudentUUId(authorizedStudentUUId) {
        return authorizedStudentUUId = authorizedStudentUUId;
    }
    return {
        getStudents,
        getAuthorizedStudentUUId,
        setStudentHeartbeat,
        setAuthorizedStudentUUId,
    };
});
//# sourceMappingURL=studentStore.js.map