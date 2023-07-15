

import { createRouter, createWebHistory } from 'vue-router'

import store from "../store/pinia/indexStore";
import useAuthHelper from "../helpers/authHelper";
const authHelper = useAuthHelper();

import { useUserStore } from "../store/pinia/userStore";
const userStore = useUserStore();


const routes = [
  {
    path: '/',
    component: () => import('@/components/Welcome.vue'),
    name: "main",
    meta: { requiresAuth: false },
  },
  {
    path: '/login',
    component: () => import('@/components/Login.vue'),
    name: "login",
    meta: { requiresAuth: false },
  },
  {
    path: '/lessons',
    component: () => import('@/components/Lessons.vue'),
    name: "lessons",
    meta: { requiresAuth: true },
  },
  {
    path: '/lesson/lessonUUId',
    component: () => import('@/components/Lesson.vue'),
    name: "lesson",
    meta: { requiresAuth: true },
  },
  {
    path: '/questions',
    component: () => import('@/components/Questions.vue'),
    name: "questions",
    meta: { requiresAuth: true },
  },
  {
    path: "/question/:questionUUId",
    component: () => import('@/components/Question.vue'),
    name: "question",
    meta: { requiresAuth: true },
  },
  {
    path: '/answers',
    component: () => import('@/components/Answers.vue'),
    name: "answers",
    meta: { requiresAuth: true },
  },
  {
    path: "/answer/:answerUUId",
    component: () => import('@/components/Answer.vue'),
    name: "answer",
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from) => {
  if (!to.matched.some((record) => record.meta.requiresAuth)) {
    // auth not required
    return;
  }

  // already signed in
  if (userStore.currentUser?.uuid) {
    return;
  }

  // local access token is present
  //let access_token = window.$cookies.get("access_token");
  //console.log(access_token);
  //if (!!access_token) {
  const user = await authHelper.authLocalUserByToken();
  if (user) {
    userStore.setUser(user);
    return;
  }

  return "/login";

  // next({
  //   name: "login",
  //   params: { dialog: true, type: "Login" },
  //   query: { from: window.location.pathname },
  //});
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

export default router
