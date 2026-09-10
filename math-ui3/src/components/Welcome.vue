<template>
  <LoginDialog @register="register"></LoginDialog>
  <RegisterTeacherDialog @registered="login"></RegisterTeacherDialog>
  <RegisterStudentDialog @registered="login"></RegisterStudentDialog>
  <div class="welcome-page">
    <v-container class="welcome-container">
      <v-row no-gutters>
        <v-col class="text-center" cols="12">
          <header class="welcome-brand">
            <h1 class="welcome-brand__title">
              {{ WELCOME_PATHS.brandLine }}
            </h1>
            <p class="welcome-brand__sub">{{ WELCOME_PATHS.brandSub }}</p>
          </header>

          <!-- Two product paths -->
          <div class="path-grid">
            <!-- Classroom: teacher + students -->
            <v-card
              class="path-card path-card--classroom"
              elevation="3"
              rounded="lg"
            >
              <v-card-title class="path-card__title justify-center py-3 pb-1">
                <v-icon class="path-card__icon mr-2" size="28">
                  mdi-account-group
                </v-icon>
                <h2>{{ WELCOME_PATHS.classroom.title }}</h2>
              </v-card-title>

              <v-card-text class="path-card__body text-left">
                <template v-if="userStore.isTeacher()">
                  <p class="path-card__subtitle">
                    {{ WELCOME_PATHS.classroom.teacherBlurb }}
                  </p>
                  <ol class="hero-steps">
                    <li
                      v-for="(step, index) in TEACHER_WORKFLOW_STEPS"
                      :key="step"
                      class="hero-step"
                    >
                      <span class="hero-step__num" aria-hidden="true">{{
                        index + 1
                      }}</span>
                      <span class="hero-step__text">{{ step }}</span>
                    </li>
                  </ol>
                </template>
                <p
                  v-else-if="userStore.getCurrentUser()"
                  class="path-card__subtitle"
                >
                  {{ WELCOME_PATHS.classroom.studentBlurb }}
                </p>
                <p v-else class="path-card__subtitle">
                  {{ WELCOME_PATHS.classroom.guestBlurb }}
                </p>
              </v-card-text>

              <v-card-actions class="path-card__actions px-4 pb-4 pt-0 flex-column">
                <v-btn
                  v-if="!userStore.getCurrentUser()"
                  data-cy="signup_btn"
                  color="orange"
                  size="large"
                  elevation="2"
                  rounded
                  block
                  class="path-cta"
                  @click="register(false, '')"
                >
                  {{ WELCOME_PATHS.classroom.ctaGuest }}
                  <v-icon end class="ml-2">mdi-arrow-right</v-icon>
                </v-btn>
                <nav
                  v-if="!userStore.getCurrentUser()"
                  class="welcome-auth"
                  aria-label="Classroom account"
                >
                  <v-btn
                    data-cy="signin_teacher_btn"
                    variant="text"
                    color="primary"
                    density="comfortable"
                    class="welcome-auth__btn text-decoration-underline"
                    @click="login('TEACHER', '')"
                  >
                    {{ WELCOME_PATHS.classroom.signInTeacher }}
                  </v-btn>
                  <span class="welcome-auth__sep">·</span>
                  <v-btn
                    variant="text"
                    color="primary"
                    density="comfortable"
                    class="welcome-auth__btn text-decoration-underline"
                    @click="login('STUDENT', '')"
                  >
                    {{ WELCOME_PATHS.classroom.signInStudent }}
                  </v-btn>
                </nav>
                <v-btn
                  v-else
                  color="orange"
                  size="large"
                  elevation="2"
                  rounded
                  block
                  class="path-cta"
                  @click="navToLessons"
                >
                  {{
                    userStore.isTeacher()
                      ? WELCOME_PATHS.classroom.ctaTeacher
                      : WELCOME_PATHS.classroom.ctaStudent
                  }}
                  <v-icon end class="ml-2">mdi-arrow-right</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>

            <!-- Practice: student + AI tutor -->
            <v-card
              class="path-card path-card--practice"
              elevation="3"
              rounded="lg"
            >
              <v-card-title class="path-card__title justify-center py-3 pb-1">
                <v-icon class="path-card__icon mr-2" size="28">
                  mdi-robot-outline
                </v-icon>
                <h2>{{ WELCOME_PATHS.practice.title }}</h2>
              </v-card-title>

              <v-card-text class="path-card__body text-left">
                <p class="path-card__subtitle">
                  {{ WELCOME_PATHS.practice.blurb }}
                </p>
              </v-card-text>

              <v-card-actions class="path-card__actions px-4 pb-4 pt-0 flex-column">
                <v-btn
                  v-if="!userStore.getCurrentUser()"
                  color="teal-darken-1"
                  size="large"
                  elevation="2"
                  rounded
                  block
                  class="path-cta"
                  @click="navToPractice"
                >
                  {{ WELCOME_PATHS.practice.ctaGuest }}
                  <v-icon end class="ml-2">mdi-arrow-right</v-icon>
                </v-btn>
                <v-btn
                  v-else
                  color="teal-darken-1"
                  size="large"
                  elevation="2"
                  rounded
                  block
                  class="path-cta"
                  @click="navToPractice"
                >
                  {{ WELCOME_PATHS.practice.cta }}
                  <v-icon end class="ml-2">mdi-arrow-right</v-icon>
                </v-btn>
                <v-btn
                  color="teal-darken-1"
                  variant="text"
                  rounded
                  block
                  class="path-cta mt-1"
                  @click="navToBlankPractice"
                >
                  {{ WELCOME_PATHS.practice.blankCta }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </div>

          <!-- Features card -->
          <v-card class="features-card" elevation="2" rounded="lg">
            <v-card-title class="text-left"> Key Features </v-card-title>
            <v-row no-gutters>
              <v-col cols="12" md="6">
                <v-list class="feature-list justify-center pa-2">
                  <v-list-item v-for="b in bullets" :key="b" class="mb-1">
                    <v-list-item-title class="d-flex align-center">
                      <v-icon color="success" class="mr-4" size="large">
                        mdi-check-circle
                      </v-icon>
                      <span class="feature-list__text">{{ b }}</span>
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col
                cols="12"
                md="6"
                class="d-flex align-center justify-center"
              >
                <v-container class="text-center">
                  <v-btn
                    href="https://www.youtube.com/watch?v=8bXmQ2KoIrI"
                    target="_blank"
                    color="orange"
                    size="large"
                    elevation="4"
                    rounded
                    block
                    class="tutorial-btn"
                  >
                    <v-icon start class="mr-2">mdi-youtube</v-icon>
                    Watch Tutorial Video
                  </v-btn>
                </v-container>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../store/pinia/userStore";
import { UserType } from "common/unions";
import {
  TEACHER_WORKFLOW_STEPS,
  WELCOME_PATHS,
} from "../constants/helpCopy";

const LoginDialog = defineAsyncComponent(() => import("./Login.vue"));
const RegisterStudentDialog = defineAsyncComponent(
  () => import("./RegisterStudent.vue"),
);
const RegisterTeacherDialog = defineAsyncComponent(
  () => import("./RegisterTeacher.vue"),
);

const router = useRouter();
const userStore = useUserStore();

function register(isStudent: boolean, redirectAfterLogin: string) {
  if (isStudent) {
    router.push({
      name: "registerStudent",
      query: { from: redirectAfterLogin },
    });
  } else {
    router.push({
      name: "registerTeacher",
    });
  }
}

function login(userType: UserType, redirectAfterLogin: string) {
  router.push({
    name: "login",
    query: { userType: userType, from: redirectAfterLogin },
  });
}

function navToLessons() {
  router.push("/lessons");
}

function navToPractice() {
  router.push("/practice");
}

function navToBlankPractice() {
  router.push({ name: "practiceBlank" });
}

const bullets = [
  "Type math on the grid with your keyboard",
  "Select, move, and Ctrl+drag to duplicate work",
  "Lines, text boxes, and optional free sketch",
  "Classroom: board sharing with your teacher and students",
  "Practice: Check answer, tips, or spoken help by subject",
];
</script>

<style scoped>
.welcome-page {
  --app-bar-height: 64px;
  --footer-height: 56px;
  --classroom-accent: #ea580c;
  --practice-accent: #0f766e;

  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
  min-height: 100%;
  margin-top: 0;
  margin-bottom: auto;
  max-width: 100vw;
  padding-top: 100px;
  padding-bottom: 1.5rem;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
}

.welcome-container {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.welcome-brand {
  max-width: 960px;
  margin: 0 auto 1.25rem;
  padding: 0 0.5rem;
}

.welcome-brand__title {
  margin: 0;
  font-size: 2.35rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #1f2937;
  line-height: 1.15;
}

.welcome-auth {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.1rem;
  width: 100%;
  margin-top: 0.35rem;
}

.welcome-auth__btn {
  min-width: unset !important;
  padding-inline: 4px !important;
  font-size: 0.9rem !important;
  font-weight: 600 !important;
}

.welcome-auth__sep {
  color: #94a3b8;
  font-size: 0.9rem;
  user-select: none;
}

.welcome-brand__sub {
  margin: 0.5rem auto 0;
  max-width: 42rem;
  font-size: 1.05rem;
  font-weight: 500;
  color: #475569;
  line-height: 1.4;
  white-space: nowrap;
}

.path-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  max-width: 960px;
  margin: 0 auto 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

.path-card,
.features-card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  text-align: left;
}

.features-card {
  max-width: 960px;
  margin: 0 auto 1.5rem;
}

.path-card--classroom {
  border-top: 4px solid var(--classroom-accent);
}

.path-card--practice {
  border-top: 4px solid var(--practice-accent);
  background: linear-gradient(180deg, #f0fdfa 0%, #ffffff 42%);
}

.path-card__title {
  flex-wrap: wrap;
  gap: 0.25rem;
}

.path-card__title h2 {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  color: #1f2937;
  white-space: normal;
  overflow-wrap: anywhere;
}

.path-card--classroom .path-card__icon {
  color: var(--classroom-accent);
}

.path-card--practice .path-card__icon {
  color: var(--practice-accent);
}

.path-card__body {
  flex: 1;
  padding-top: 0 !important;
}

.path-card__subtitle {
  margin: 0 0 0.75rem;
  font-size: 0.98rem;
  font-weight: 600;
  color: #475569;
  line-height: 1.4;
}

.path-card__lead {
  margin: 0 0 0.75rem;
  font-size: 0.92rem;
  color: #334155;
  line-height: 1.45;
}

.path-card__actions {
  margin-top: auto;
}

.path-cta {
  max-width: 100%;
}

.hero-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.hero-step {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0;
  padding: 10px 12px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 10px;
}

.hero-step__num {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--classroom-accent);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-step__text {
  font-size: 0.88rem;
  line-height: 1.35;
  color: #334155;
}

.tutorial-btn {
  transition: transform 0.2s;
}

.feature-list .v-list-item-title,
.feature-list__text {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  min-width: 0;
  white-space: normal;
}

.features-card .v-card-title {
  color: #334155;
}

@media (max-width: 860px) {
  .path-grid {
    grid-template-columns: 1fr;
  }

  .welcome-brand__title {
    font-size: 1.85rem;
  }

  .welcome-brand__sub {
    white-space: normal;
  }
}

@media (max-width: 760px) {
  .welcome-page {
    padding: 0.5rem;
    padding-top: 100px;
    padding-bottom: 0.5rem;
  }

  .path-card,
  .features-card {
    margin-left: 0;
    margin-right: 0;
    width: 100%;
  }

  .tutorial-btn {
    width: 100%;
  }

  .feature-list .v-list-item-title,
  .feature-list__text {
    font-size: 0.92rem;
  }
}

.tutorial-btn:hover {
  transform: scale(1.05);
}

.v-list-item__content {
  justify-content: center !important;
  text-align: left !important;
  display: grid !important;
}

:deep(.v-container) {
  max-width: 100% !important;
  padding-left: 1rem !important;
  padding-right: 1rem !important;
}

.v-btn {
  transition: all 0.2s ease;
}

.v-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}
</style>
