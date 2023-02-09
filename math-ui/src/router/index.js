import VueRouter from "vue-router";
import Welcome from "../components/Welcome.vue";
import Login from "../components/Login.vue";
import Lessons from "../components/Lessons.vue";
import Lesson from "../components/Lesson.vue";
import Questions from "../components/Questions.vue";
import Question from "../components/Question.vue";
import Answers from "../components/Answers.vue";
import Answer from "../components/Answer.vue";

import store from "../store/index.js";

const router = new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/",
      component: Welcome,
      meta: { requiresAuth: false },
    },
    {
      path: "/login",
      component: Login,
      name: "login",
      meta: { requiresAuth: false },
      props: { default: true },
    },
    {
      path: "/lessons",
      component: Lessons,
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: "/lesson/:LessonUUId",
      name: "lesson",
      component: Lesson,
      meta: { requiresAuth: true },
    },
    {
      path: "/questions",
      component: Questions,
      meta: { requiresAuth: true },
    },
    {
      path: "/question/:questionUUId",
      name: "question",
      component: Question,
      meta: { requiresAuth: true },
    },
    {
      path: "/answers",
      component: Answers,
      meta: { requiresAuth: true },
    },
    {
      path: "/answer/:answerUUId",
      name: "answer",
      component: Answer,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  // auth not required
  if (!to.matched.some((record) => record.meta.requiresAuth)) {
    next();
    return;
  }

  // already signed in
  if (!!store.getters.getUser?.id) {
    next();
    return;
  }

  // local access token is present
  if (!!window.$cookies.get("access_token")) {
    let user = await store.dispatch("authLocalUserByToken");
    if (!!user) {
      await store.dispatch("setUser", user);
      next();
      return;
    }

    // local token is invalid
    next({
      path: "/login",
      query: { from: window.location.pathname },
    });
  }

  /*

  // google auth exists for our domain
  let googleUser = await authMixin.methods.mixin_getGoogleUser();
  if (!!googleUser) {
    user = await store.dispatch("authGoogleUser");
    if (!user) {
      // local auth info removed at the server side -> re-create
      user = await store.dispatch("registerUser", googleUser);
    }
    user = await store.dispatch("setUser", { ...user, ...googleUser });
    next();
    return;
  }*/

  // could not find user info -> login/register
  next({
    name: "login",
    params: { dialog: true, type: "Login" },
    query: { from: window.location.pathname },
  });
});

export default router;
