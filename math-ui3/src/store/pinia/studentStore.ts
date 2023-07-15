import { defineStore } from "pinia";
import User from "../../../../math-db/src/models/user.model";
import { reactive, ref } from "vue";
import dbHelper from "../../helpers/dbHelper";
const db = dbHelper();

export const useStudentStore = defineStore("studentanswer", () => {

  let students: Map<String, User> = reactive(<Map<String, User>>{});
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
