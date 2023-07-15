import { defineStore } from "pinia";
import User from "../../../../math-db/src/models/user.model";
import dbHelper  from "../../helpers/dbHelper";
const db = dbHelper();

export const useUserStore = defineStore("user", () => {
  let currentUser: User | null = new User();
  let authorized = false;

  function isTeacher(): boolean {
    return currentUser?.userType === "TEACHER";
  }

  function setUserWriteAuthorization(isAauthorized: boolean) {
    authorized = isAauthorized;
  }

  function setUser(user: User) {
    currentUser = user;
  }

  function registerUser(user: User) {
    db.registerUser(user);
  }


  return {
    currentUser,
    authorized,
    setUserWriteAuthorization,
    isTeacher,
    setUser,
    registerUser,
  };
});
