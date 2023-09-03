import { defineStore } from "pinia";
import { UserAttributes } from "../../../../math-common/build/notationTypes";
import { reactive, ref } from "vue";

export const useStudentStore = defineStore("studentanswer", () => {

  let students: Map<String, UserAttributes> = reactive(
    <Map<String, UserAttributes>>{}
  );
  let authorizedStudentUUId = ref("");


  function setStudentHeartbeat(uuid: string): void {
    let student = students.get(uuid);
    if (student) {
      student.lastHeartbeatTime = new Date();
    }
  };

  function toggleAuthorization(userUUId: string) {
    authorizedStudentUUId.value = userUUId;
  };

  return {
    students,
    authorizedStudentUUId,
    setStudentHeartbeat,
  };
});
