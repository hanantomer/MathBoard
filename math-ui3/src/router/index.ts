import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { restoreSessionFromCookie } from "../composables/restoreSession";
import useSeo from "../composables/useSeo";
import { trackMetaPixelPageView } from "../helpers/metaPixelHelper";

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
      title: "Math Whiteboard — Live classroom and AI math tutor",
      description:
        "Two ways to use the same board: live lessons with teachers and students, or solo AI-tutor practice. Type math on a grid, check work, and collaborate in class.",
      keywords:
        "math whiteboard, live classroom, AI math tutor, math practice, collaborative learning, teacher tools, interactive math",
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
    path: "/practice",
    component: () => import("@/components/PracticeQuestions.vue"),
    name: "practice",
    meta: {
      requiresAuth: false,
      title: "AI Math Tutor — Practice on Math Whiteboard",
      description:
        "Solo math practice on an interactive board. Pick a subject or start a blank sheet, check answers, and get text or voice tips. Work stays on this device. No account needed.",
      keywords:
        "AI math tutor, math practice, self-study, interactive math board, check answers, voice coach",
    },
  },
  {
    path: "/practice/blank",
    component: () => import("@/components/Practice.vue"),
    name: "practiceBlank",
    meta: {
      requiresAuth: false,
      title: "Blank Practice Sheet — AI Math Tutor",
      description:
        "Practice on a blank board with an AI tutor: write or paste a question, or upload a worksheet image. Work stays on this device.",
      keywords:
        "AI math tutor, blank sheet, paste text, worksheet image, math practice",
    },
  },
  {
    path: "/practice/:questionUUId",
    component: () => import("@/components/Practice.vue"),
    name: "practiceQuestion",
    meta: {
      requiresAuth: false,
      title: "Practice — AI Math Tutor",
      description: "Work on a practice question with local scratch work and AI tutor tips.",
      keywords: "AI math tutor, math practice, problem solving",
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
      requiresAuth: false,
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

router.beforeEach(async (to) => {
  const user = await restoreSessionFromCookie();
  if (user) {
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
    "Math Whiteboard is an interactive board for live classroom lessons and solo AI-tutor practice.";
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

  trackMetaPixelPageView(
    to.fullPath,
    (to.meta.title as string | undefined) || undefined,
  );
});

export default router;
