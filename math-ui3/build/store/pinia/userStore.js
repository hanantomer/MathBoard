import { defineStore } from "pinia";
import dbHelper from "../../helpers/dbHelper";
import { UesrType } from "common/enum";
const db = dbHelper();
export const useUserStore = defineStore("user", () => {
    let currentUser = new Object();
    let authorized = false;
    function getCurrentUser() {
        return currentUser;
    }
    function isTeacher() {
        return currentUser?.userType?.toString() === UesrType[UesrType.TEACHER].toString();
    }
    function getAuthorized() {
        return authorized;
    }
    function setAuthorized(authorized) {
        return authorized = authorized;
    }
    function setCurrentUser(user) {
        currentUser = user;
    }
    function registerUser(user) {
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
//# sourceMappingURL=userStore.js.map