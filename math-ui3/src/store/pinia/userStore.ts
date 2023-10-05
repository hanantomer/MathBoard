import { defineStore } from "pinia";
import { UserAttributes, UserCreationAttributes } from "common/userTypes";
import dbHelper  from "../../helpers/dbHelper";
import { UesrType } from "common/unions";
const db = dbHelper();

export const useUserStore = defineStore("user", () => {
  let currentUser: UserAttributes = new Object() as UserAttributes;
  let authorized = false;

  function getCurrentUser(): UserAttributes {
    return currentUser;
  }

  function isTeacher(): boolean {
    return currentUser?.userType === "TEACHER";
  }

  function getAuthorized(): boolean {
    return authorized;
  }

  function setAuthorized(authorized: boolean) {
    return authorized = authorized;
  }

  function setCurrentUser(user: UserAttributes) {
    currentUser = user;
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
