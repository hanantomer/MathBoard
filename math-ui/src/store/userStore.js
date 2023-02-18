import Vue from "vue";
import dbSyncMixin from "../Mixins/dbSyncMixin";

export default {
  modules: {
    dbSyncMixin,
  },
  state: {
    loggedUser: {},
  },
  getters: {
    getUser: function (state) {
      return state.loggedUser;
    },
  },
  mutations: {
    setUser(state, user) {
      Vue.set(state, "loggedUser", user);
    },
    setUserWriteAuthorization(state, authorized) {
      Vue.set(state, "loggedUser", {
        ...state.loggedUser,
        authorized: authorized,
      });
    },
  },
  actions: {
    async setUserWriteAuthorization(context, authorized) {
      context.commit("setUserWriteAuthorization", authorized);
    },
    async setUser(context, user) {
      context.commit("setUser", user);
      return user;
    },
    async authLocalUserByToken(context) {
      return dbSyncMixin.methods.authLocalUserByToken();
    },
    async authLocalUserByPassword(context, user) {
      return dbSyncMixin.methods.authLocalUserByPassword(
        user.email,
        user.password
      );
    },
    async authGoogleUser(context) {
      return await dbSyncMixin.methods.authGoogleUser();
    },
    async registerUser(context, user) {
      return dbSyncMixin.methods.registerUser(user);
    },
  },
};
