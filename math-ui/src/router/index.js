import VueRouter from "vue-router";
import Welcome from "../components/Welcome.vue";
// import Login from "../components/Login.vue";
import Lessons from "../components/Lessons.vue";
import Lesson from "../components/Lesson.vue";
import store from "../store/index.js";
import authMixin from "../Mixins/authMixin.js";

const router = new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/",
      component: Welcome,
      meta: { requiresAuth: false },
    },
    {
      path: "/lessons",
      component: Lessons,
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: "/symbols/:lessonId",
      name: "symbols",
      component: Lesson,
      props: true,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  if (
    to.matched.some((record) => record.meta.requiresAuth) &&
    !store.getters.getUser.id
  ) {
    let user = await store.dispatch("setUser", {});
    if (window.$cookies.get("access_token")) {
      // local
      user = await store.dispatch("authLocalUserByToken");
      if (!!user) {
        await store.dispatch("setUser", user);
      }
    } else {
      // google
      let googleUser = await authMixin.methods.mixin_getGoogleUser();
      if (!!googleUser) {
        user = await store.dispatch("mixin_authGoogleUser");
        if (!user) {
          user = await store.dispatch("mixin_registerUser", googleUser);
        }
        user = await store.dispatch("setUser", { ...user, ...googleUser });
      }
    }
    if (!user || !user.id) {
      const loginpath = window.location.pathname;
      next({
        path: "/",
        query: { from: loginpath },
        params: { nextUrl: to.fullPath },
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
