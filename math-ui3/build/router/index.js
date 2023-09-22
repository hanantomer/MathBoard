import { createRouter, createWebHistory } from 'vue-router';
import useAuthHelper from "../helpers/authHelper";
import { useUserStore } from "../store/pinia/userStore";
import { useCookies } from "vue3-cookies";
const authHelper = useAuthHelper();
const cookies = useCookies().cookies;
const routes = [
    {
        path: "/",
        component: () => import("@/components/Welcome.vue"),
        name: "main",
        meta: { requiresAuth: false },
        props: true,
    },
    {
        path: "/login",
        component: () => import("@/components/Welcome.vue"),
        name: "login",
        meta: { requiresAuth: false },
        props: { login: true },
    },
    // {
    //   path: "/register",
    //   component: () => import("@/components/Welcome.vue"),
    //   name: "register",
    //   meta: { requiresAuth: false },
    //   props: { register: true },
    // },
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
];
const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});
router.beforeEach(async (to, from) => {
    const userStore = useUserStore();
    if (!to.matched.some((record) => record.meta.requiresAuth)) {
        // auth not required
        return;
    }
    if (userStore.getCurrentUser().id) {
        // already authenticated
        return;
    }
    const user = await authHelper.authLocalUserByToken();
    if (user) {
        // has valid token
        userStore.setCurrentUser(user);
        return;
    }
    return { path: "/login", query: { from: to.path } };
    //next({
    //  query: { from: window.location.pathname },
    //  path: "/login",
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
export default router;
//# sourceMappingURL=index.js.map