import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../components/Login.vue";
import Exercises from "../components/Exercises.vue";
import MathBoard from "../components/MathBoard.vue";
import store from "../store/index.js";

const router = new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/login",
      component: Login,
      meta: { guest: true },
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

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    let user = store.getters.getUser;
    console.log(user);
    if (!user.name) {
      next({
        path: "/login",
        params: { nextUrl: to.fullPath },
      });
    } else {
      //let user = JSON.parse(Vue.get("user"));
      next();
    }
  } //else if (to.matched.some((record) => record.meta.guest)) {
  //if (Vue.cookie.get("token") == null) {
  next();
  //}
  //} else {
  //  next();
  //}
});

export default router;
