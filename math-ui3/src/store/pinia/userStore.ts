import { ref } from "vue";
import { defineStore } from "pinia";
import { UserAttributes, UserCreationAttributes } from "common/userTypes";

import dbHelper from "../../helpers/dbHelper";
const db = dbHelper();

export const useUserStore = defineStore("user", () => {
  let currentUser = ref<UserAttributes | null>();
  let authorized = ref(false);

  function getCurrentUser(): UserAttributes | undefined | null {
    return currentUser.value;
  }

  function isTeacher(): boolean {
    return currentUser.value?.userType === "TEACHER";
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

  function registerUser(user: UserCreationAttributes) {
    db.registerUser(user); /// todo set to current
  }

  return {
    getCurrentUser,
    getAuthorized,
    setAuthorized,
    isTeacher,
    setCurrentUser,
    registerUser,
  };
});
