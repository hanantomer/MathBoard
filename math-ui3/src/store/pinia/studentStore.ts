import { defineStore } from "pinia";
import { UserAttributes } from "common/userTypes";
import { ref } from "vue";
import apiHelper from "../../helpers/apiHelper";

export const useStudentStore = defineStore("studentanswer", () => {
  let students = ref(<Map<String, UserAttributes>>new Map());

  let authorizedStudentUUId = ref<string | null>(null);

  function getStudents() {
    return Array.from(students.value.values());
  }

  function getAuthorizedStudentUUId() {
    return authorizedStudentUUId.value;
  }

  async function setStudentHeartbeat(userUUId: string) {
    const db = apiHelper();
    if (!students.value.get(userUUId)) {
      const user = await db.getUser(userUUId);
      students.value.set(user.uuid, user);
    }
    students.value.get(userUUId)!.lastHeartbeatTime = new Date();
  }

  function setAuthorizedStudentUUId(newAuthorizedStudentUUId: string | null) {
    authorizedStudentUUId.value = newAuthorizedStudentUUId;
  }

  return {
    getStudents,
    getAuthorizedStudentUUId,
    setStudentHeartbeat,
    setAuthorizedStudentUUId,
  };
});
