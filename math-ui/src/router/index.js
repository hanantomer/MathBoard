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
import authMixin from "../Mixins/authMixin";

const router = new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "main",
      component: Welcome,
      meta: { requiresAuth: false },
    },
    {
      path: "/login",
      component: Login,
      name: "login",
      meta: { requiresAuth: false },
      props: true,
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
  if (!to.matched.some((record) => record.meta.requiresAuth)) {
    // auth not required
    next();
    return;
  }

  // already signed in
  if (!!store.getters.getUser?.id) {
    next();
    return;
  }

  // local access token is present
  //let access_token = window.$cookies.get("access_token");
  //console.log(access_token);
  //if (!!access_token) {
  let user = await authMixin.methods.mixin_authLocalUserByToken();
  if (!!user) {
    store.dispatch("setUser", user);
    next();
    return;
  }
  next({
    name: "login",
    params: { dialog: true, type: "Login" },
    query: { from: window.location.pathname },
  });

  //}

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
});

export default router;
