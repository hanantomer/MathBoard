import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import useApiHelper from "../helpers/apiHelper";
import { useUserStore } from "../store/pinia/userStore";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: () => import("@/components/Welcome.vue"),
    name: "main",
    meta: { requiresAuth: false },
    props: true,
  },
  {
    path: "/contactUs",
    component: () => import("@/components/ContactUs.vue"),
    name: "contactUs",
    meta: { requiresAuth: false },
  },

  {
    path: "/login",
    component: () => import("@/components/Welcome.vue"),
    name: "login",
    meta: { requiresAuth: false },
  },
  {
    path: "/registerTeacher",
    component: () => import("@/components/Welcome.vue"),
    name: "registerTeacher",
    meta: { requiresAuth: false, props: true },
  },
  {
    path: "/registerStudent",
    component: () => import("@/components/Welcome.vue"),
    name: "registerStudent",
    meta: { requiresAuth: false, props: true },
  },
  {
    path: "/lessons",
    component: () => import("@/components/Lessons.vue"),
    name: "lessons",
    meta: { requiresAuth: true },
  },
  {
    path: "/lesson/:lessonUUId",
    component: () => import("@/components/Lesson.vue"),
    name: "lesson",
    meta: { requiresAuth: true },
  },
  {
    path: "/questions",
    component: () => import("@/components/Questions.vue"),
    name: "questions",
    meta: { requiresAuth: true },
  },
  {
    path: "/question/:questionUUId",
    component: () => import("@/components/Question.vue"),
    name: "question",
    meta: { requiresAuth: true },
  },
  {
    path: "/answers",
    component: () => import("@/components/Answers.vue"),
    name: "answers",
    meta: { requiresAuth: true },
  },
  {
    path: "/answer/:answerUUId",
    component: () => import("@/components/Answer.vue"),
    name: "answer",
    meta: { requiresAuth: true },
  },
  {
    path: "/reset-password",
    name: "reset-password",
    component: () => import("../components/ResetPassword.vue"),
  },
  {
    path: "/uploadPhoto/:lessonUUId/:userUUId",
    name: "uploadPhoto",
    props: true,
    component: () => import("../components/UploadPhoto.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from) => {
  const userStore = useUserStore();
  const apiHelper = useApiHelper();

  if (userStore.getCurrentUser()) {
    return;
  }

  const user = await apiHelper.getUserByAccessToken();
  if (user) {
    userStore.setCurrentUser(user);
    return;
  }

  if (!to.matched.some((record) => record.meta.requiresAuth)) {
    // auth not required
    return;
  }

  return {
    path: "/login",
    query: { from: to.path },
  };
});

export default router;
