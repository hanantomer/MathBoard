import { defineStore } from "pinia";
import { UserAttributes } from "../../../../math-db/src/models/user.model";
import dbHelper  from "../../helpers/dbHelper";
import { UesrType } from "../../../../math-common/src/enum";
const db = dbHelper();

export const useUserStore = defineStore("user", () => {
  let currentUser: UserAttributes | undefined;
  let authorized = false;

  function isTeacher(): boolean {
    return currentUser?.userType === UesrType.TEACHER;
  }

  function setUserWriteAuthorization(isAauthorized: boolean) {
    authorized = isAauthorized;
  }

  function setUser(user: UserAttributes) {
    currentUser = user;
  }

  function registerUser(user: UserAttributes) {
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
