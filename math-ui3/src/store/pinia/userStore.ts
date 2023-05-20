import { defineStore } from "pinia";
import { User } from "../../../../math-db/src/models/user.model";
import dbSync from "../../Mixins/dbSyncMixin";
const db = dbSync();

export const useUserStore = defineStore("user", {
  state: () => ({
    currentUser: <User>{},
  }),

  getters: {
    getCurrentUser: function (): User {
      return this.currentUser;
    },
  },

  actions: {
    setUserWriteAuthorization(authorized: boolean) {
      this.currentUser.authorized = authorized;
    },
    setUser(user: User) {
      this.currentUser = user;
    },
    registerUser(user: User) {
      db.registerUser(user);
    },
  },
});
