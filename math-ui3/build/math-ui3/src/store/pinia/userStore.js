import { defineStore } from "pinia";
import dbHelper from "../../helpers/dbHelper";
import { UesrType } from "../../../../math-common/src/enum";
const db = dbHelper();
export const useUserStore = defineStore("user", () => {
    let currentUser = new Object();
    let authorized = false;
    function isTeacher() {
        return currentUser.userType === UesrType.TEACHER;
    }
    function setUserWriteAuthorization(isAauthorized) {
        authorized = isAauthorized;
    }
    function setUser(user) {
        currentUser = user;
    }
    function registerUser(user) {
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
//# sourceMappingURL=userStore.js.map
