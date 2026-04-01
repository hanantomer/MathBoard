import { ref } from "vue";
import { defineStore } from "pinia";
import { UserAttributes } from "common/userTypes";

export const useUserStore = defineStore("user", () => {
  let currentUser = ref<UserAttributes | null>();
  let authorized = ref(false);
  let loginAsStudent = ref(false);

  function getCurrentUser(): UserAttributes | undefined | null {
    return currentUser.value;
  }

  function isTeacher(): boolean {
    return (
      (currentUser.value?.userType === "TEACHER" ||
        currentUser.value?.userType === "BOTH") &&
      !loginAsStudent.value
    );
  }

  function getAuthorized(): boolean {
    return authorized.value;
  }

  function setAuthorized(authorizedValue: boolean) {
    authorized.value = authorizedValue;
  }

  function setCurrentUser(user: UserAttributes | null) {
    currentUser.value = user;
  }

  function setLoginAsStudent(value: boolean) {
    loginAsStudent.value = value;
  }

  return {
    getCurrentUser,
    getAuthorized,
    setAuthorized,
    isTeacher,
    setCurrentUser,
    setLoginAsStudent,
  };
});
