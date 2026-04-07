import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import useApiHelper from "../helpers/apiHelper";
import { useUserStore } from "../store/pinia/userStore";
import useSeo from "../composables/useSeo";

/**
 * Extended meta interface to include SEO information
 */
declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
    title?: string;
    description?: string;
    keywords?: string;
    breadcrumbs?: Array<{ name: string; url: string }>;
  }
}

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: () => import("@/components/Welcome.vue"),
    name: "main",
    meta: {
      requiresAuth: false,
      title:
        "Math Whiteboard - Online Collaborative Mathematics Learning Platform",
      description:
        "Welcome to Math Whiteboard, an interactive online platform that enables teachers to create custom mathematics lessons and questions, while facilitating real-time collaboration between students and educators.",
      keywords:
        "mathematics, online learning, math platform, collaborative learning, interactive math, teacher tools, create lessons",
    },
    props: true,
  },

  {
    path: "/login",
    component: () => import("@/components/Welcome.vue"),
    name: "login",
    meta: {
      requiresAuth: false,
      title: "Login - MathBoard",
      description:
        "Log in to your MathBoard account to create lessons, manage questions, review student answers, and facilitate collaborative mathematics learning.",
      keywords: "login, sign in, mathematics learning, teacher tools",
    },
  },
  {
    path: "/registerTeacher",
    component: () => import("@/components/Welcome.vue"),
    name: "registerTeacher",
    meta: {
      requiresAuth: false,
      title: "Teacher Registration - MathBoard",
      description:
        "Register as a teacher on MathBoard to create custom mathematics lessons, design questions, review student answers, and manage collaborative learning activities.",
      keywords:
        "teacher registration, educator, math teaching, create lessons, question design",
    },
    props: true,
  },
  {
    path: "/registerStudent",
    component: () => import("@/components/Welcome.vue"),
    name: "registerStudent",
    meta: {
      requiresAuth: false,
      title: "Student Registration - MathBoard",
      description:
        "Register as a student on MathBoard to access teacher-created lessons, answer questions, collaborate with peers, and receive feedback on your mathematics work.",
      keywords:
        "student registration, math learning, education, collaborative learning",
    },
    props: true,
  },
  {
    path: "/lessons",
    component: () => import("@/components/Lessons.vue"),
    name: "lessons",
    meta: {
      requiresAuth: true,
      title: "Math Lessons - MathBoard",
      description:
        "Browse and access teacher-created mathematics lessons designed for interactive learning and collaboration.",
      keywords:
        "math lessons, education, teaching resources, teacher created content",
    },
  },
  {
    path: "/lesson/:lessonUUId",
    component: () => import("@/components/Lesson.vue"),
    name: "lesson",
    meta: {
      requiresAuth: true,
      title: "Math Lesson - MathBoard",
      description:
        "View and interact with teacher-created mathematics lesson content, featuring collaborative tools and interactive learning activities.",
      keywords: "math lesson, teaching, education, interactive learning",
    },
  },
  {
    path: "/questions",
    component: () => import("@/components/Questions.vue"),
    name: "questions",
    meta: {
      requiresAuth: true,
      title: "Math Questions - MathBoard",
      description:
        "Access teacher-designed mathematics questions to practice problem-solving skills and test understanding through collaborative learning.",
      keywords: "math questions, practice, assessment, teacher created",
    },
  },
  {
    path: "/question/:questionUUId",
    component: () => import("@/components/Question.vue"),
    name: "question",
    meta: {
      requiresAuth: true,
      title: "Mathematics Question - MathBoard",
      description:
        "Work on teacher-designed mathematics questions and improve your problem-solving skills through collaborative learning and feedback.",
      keywords: "math question, practice, problem solving, teacher created",
    },
  },
  {
    path: "/answers",
    component: () => import("@/components/Answers.vue"),
    name: "answers",
    meta: {
      requiresAuth: true,
      title: "Math Answers - MathBoard",
      description:
        "View and review student answers to teacher-created mathematics questions, providing feedback and assessment.",
      keywords: "math answers, solutions, review, teacher feedback",
    },
  },
  {
    path: "/answer/:answerUUId",
    component: () => import("@/components/Answer.vue"),
    name: "answer",
    meta: {
      requiresAuth: true,
      title: "Mathematics Answer - MathBoard",
      description:
        "Review detailed student answers to teacher-created mathematics questions and provide constructive feedback.",
      keywords: "math answer, solution, explanation, teacher review",
    },
  },
  {
    path: "/reset-password",
    name: "reset-password",
    component: () => import("../components/ResetPassword.vue"),
    meta: {
      requiresAuth: false,
      title: "Reset Password - MathBoard",
      description: "Reset your MathBoard account password.",
      keywords: "password reset, account recovery",
    },
  },
  {
    path: "/uploadPhoto/:lessonUUId/:userUUId",
    name: "uploadPhoto",
    props: true,
    component: () => import("../components/UploadPhoto.vue"),
    meta: {
      requiresAuth: true,
      title: "Upload Photo - MathBoard",
      description: "Upload a photo for your mathematics work.",
      keywords: "upload, photo, math work",
    },
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

/**
 * After each navigation, update SEO meta tags
 */
router.afterEach((to) => {
  const seo = useSeo();

  // Extract SEO metadata from route
  const title = (to.meta.title as string) || "MathBoard";
  const description =
    (to.meta.description as string) ||
    "MathBoard - Online Collaborative Mathematics Learning Platform";
  const keywords =
    (to.meta.keywords as string) || "mathematics, online learning";

  // Get the current domain - update this to match your actual domain
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://mathboard.com";
  const currentUrl = `${baseUrl}${to.path}`;

  // Set page meta tags
  seo.setPageMeta({
    title,
    description,
    keywords,
    url: currentUrl,
    canonicalUrl: currentUrl,
  });

  // Handle breadcrumbs if defined in route meta
  const breadcrumbs = to.meta.breadcrumbs as
    | Array<{ name: string; url: string }>
    | undefined;
  if (breadcrumbs) {
    seo.setBreadcrumbs(breadcrumbs);
  }
});

export default router;
