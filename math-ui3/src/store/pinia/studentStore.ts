import { defineStore } from "pinia";
import { UserAttributes } from "common/userTypes";
import { ref } from "vue";
import dbHelper from "../../helpers/dbHelper";
const db = dbHelper();


export const useStudentStore = defineStore("studentanswer", () => {
  let students = ref(<Map<String, UserAttributes>>new Map());

  let authorizedStudentUUId = ref("");

  function getStudents() {
    return Array.from(students.value.values());
  }

  function getAuthorizedStudentUUId() {
    return authorizedStudentUUId;
  }

  async function setStudentHeartbeat(userUUId: string) {
    if (!students.value.get(userUUId)) {
      const user = await db.getUser(userUUId);
      students.value.set(user.uuid, user);
    }
    students.value.get(userUUId)!.lastHeartbeatTime = new Date();
  }

  function setAuthorizedStudentUUId(authorizedStudentUUId: string) {
    return (authorizedStudentUUId = authorizedStudentUUId);
  }

  return {
    getStudents,
    getAuthorizedStudentUUId,
    setStudentHeartbeat,
    setAuthorizedStudentUUId,
  };
});
