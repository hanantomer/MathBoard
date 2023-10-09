import { defineStore } from "pinia";
import { UserAttributes } from "common/userTypes";
import { reactive, ref } from "vue";

export const useStudentStore = defineStore("studentanswer", () => {

  let students = ref<Map<String, UserAttributes>>(
    <Map<String, UserAttributes>>{}
  );

  let authorizedStudentUUId = ref("");

  function getStudents() {
    return students;
  }

  function getAuthorizedStudentUUId() {
    return authorizedStudentUUId;
  }

  function setStudentHeartbeat(uuid: string){
    let student = students.value.get(uuid);
    if (student) {
      student.lastHeartbeatTime = new Date();
    }
  };

  function setAuthorizedStudentUUId(authorizedStudentUUId : string) {
    return authorizedStudentUUId = authorizedStudentUUId;
  }

  return {
    getStudents,
    getAuthorizedStudentUUId,
    setStudentHeartbeat,
    setAuthorizedStudentUUId,
  };
});
