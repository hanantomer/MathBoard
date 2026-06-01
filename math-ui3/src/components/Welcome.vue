<template>
  <LoginDialog @register="register"></LoginDialog>
  <RegisterTeacherDialog @registered="login"></RegisterTeacherDialog>
  <RegisterStudentDialog @registered="login"></RegisterStudentDialog>
  <div class="welcome-page">
    <v-container class="welcome-container">
      <v-row no-gutters>
        <v-col class="text-center" cols="12">
          <!-- Sign in/up card -->
          <v-card
            v-if="!userStore.getCurrentUser()"
            class="auth-card"
            elevation="0"
            rounded="lg"
          >
            <v-card-text>
              <span class="text-h6">
                Already have an account?
                <v-btn
                  data-cy="signin_teacher_btn"
                  variant="text"
                  color="primary"
                  class="px-1 text-decoration-underline"
                  @click="login('TEACHER', '')"
                >
                  Sign in as Teacher
                </v-btn>
                or
                <v-btn
                  variant="text"
                  color="primary"
                  class="px-1 text-decoration-underline"
                  @click="login('STUDENT', '')"
                >
                  Student
                </v-btn>
                or
                <v-btn
                  data-cy="signup_btn"
                  size="x-large"
                  variant="text"
                  color="primary"
                  class="px-1 text-decoration-underline"
                  @click="register(false, '')"
                >
                  Sign up
                </v-btn>
              </span>
            </v-card-text>
          </v-card>

          <!-- Hero: headline + (teacher steps) + single CTA -->
          <v-card class="main-card" elevation="3" rounded="lg">
            <v-card-title primary-title class="justify-center py-3 pb-1">
              <h2 class="text-h4 font-weight-bold primary--text">
                Teach MATH online with
                <span class="text-orange">Math Whiteboard</span>
              </h2>
            </v-card-title>

            <v-card-text
              v-if="userStore.isTeacher()"
              class="hero-teacher-body text-left"
            >
              <p class="hero-subtitle">{{ WELCOME_TEACHER_HERO.subtitle }}</p>
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
            </v-card-text>

            <v-card-actions class="hero-actions justify-center px-4 pb-4 pt-0">
              <v-btn
                v-if="!userStore.getCurrentUser()"
                color="orange"
                size="large"
                elevation="2"
                rounded
                block
                class="px-8 hero-cta"
                v-on:click="register(false, '')"
              >
                Get Started
                <v-icon end class="ml-2">mdi-arrow-right</v-icon>
              </v-btn>
              <v-btn
                v-if="userStore.isTeacher()"
                color="orange"
                size="large"
                elevation="2"
                rounded
                block
                class="px-8 hero-cta"
                v-on:click="navToLessons"
              >
                {{ WELCOME_TEACHER_HERO.cta }}
                <v-icon end class="ml-2">mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>

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
  WELCOME_TEACHER_HERO,
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

const bullets = [
  "Type math on the grid with your keyboard",
  "Select, move, and Ctrl+drag to duplicate work",
  "Lines, text boxes, and optional free sketch",
  "Board sharing with students",
  "Submit questions and review answers",
];
</script>

<style scoped>
.welcome-page {
  --app-bar-height: 64px;
  --footer-height: 56px;

  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
  min-height: 100%;
  margin-top: 50px;
  margin-bottom: auto;
  max-width: 100vw;
  padding-top: var(--app-bar-height);
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

.main-card,
.features-card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  max-width: 900px;
  margin: 0 auto 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

.auth-card {
  background: transparent;
  max-width: 600px;
  margin: 0 auto 1rem;
  width: 100%;
  box-sizing: border-box;
}

.auth-card .text-h6 {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.hero-teacher-body {
  padding-top: 0 !important;
  max-width: 640px;
  margin: 0 auto;
}

.hero-subtitle {
  margin: 0 0 1rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: #475569;
  text-align: center;
}

.hero-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
}

.hero-step {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0;
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.hero-step__num {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-step__text {
  font-size: 0.9rem;
  line-height: 1.35;
  color: #334155;
}

.hero-actions {
  max-width: 420px;
  margin: 0 auto;
}

.hero-cta {
  max-width: 100%;
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

.main-card h2 {
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #1f2937;
}

.main-card .v-card-text,
.auth-card .v-card-text,
.features-card .v-card-title {
  color: #334155;
}

@media (max-width: 760px) {
  .welcome-page {
    padding: 0.5rem;
    padding-top: calc(var(--app-bar-height) + 0.5rem);
    padding-bottom: 0.5rem;
  }

  .main-card,
  .features-card,
  .auth-card {
    margin: 0 0 1rem;
    width: 100%;
  }

  .main-card h2 {
    font-size: 1.8rem;
    line-height: 1.2;
  }

  .hero-steps {
    grid-template-columns: 1fr;
  }

  .tutorial-btn,
  .auth-card .v-btn {
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
