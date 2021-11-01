import VueRouter from "vue-router";
import Login from "../components/Login.vue";
import Exercises from "../components/Exercises.vue";
import MathBoard from "../components/MathBoard.vue";
import store from "../store/index.js";
import authMixin from "../Mixins/authMixin.js";

const router = new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/login",
      component: Login,
      meta: { requiresAuth: false },
    },
    {
      path: "/",
      meta: { requiresAuth: true },
    },
    {
      path: "/exercises/:userId",
      component: Exercises,
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: "/mathboard/:exerciseId",
      component: MathBoard,
      props: true,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    let user = store.getters.getUser;
    if (!user.id) {
      if (window.$cookies.get("token")) {
        // local
        user = await store.dispatch("authLocalUserByToken");
        console.log(user);
        if (!!user) {
          await store.dispatch("setUser", user);
        }
      } else {
        // google
        let googleUser = await authMixin.methods.authMixin_getGoogleUser();
        if (!!googleUser) {
          user = await store.dispatch("authGoogleUser");
          console.log(user);
          if (!!user) {
            await store.dispatch("setUser", { ...user, ...googleUser });
          } else {
            user = await store.dispatch("registerUser", googleUser);
          }
        }
      }
    }
    if (!user.id) {
      next({
        path: "/login",
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
