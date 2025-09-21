<template>
  <LoginDialog @register="register"></LoginDialog>
  <RegisterTeacherDialog @registered="login"></RegisterTeacherDialog>
  <RegisterStudentDialog @registered="login"></RegisterStudentDialog>
  <v-main class="welcome-page">
    <v-container>
      <v-row>
        <v-col class="text-center" cols="12">
          <!-- Sign in/up card -->
          <v-card
            v-if="!userStore.getCurrentUser()"
            class="mb-6 auth-card"
            elevation="0"
            rounded="lg"
          >
            <v-card-text>
              <span class="text-h6">
                Already have an account?
                <v-btn
                  variant="text"
                  color="primary"
                  class="px-1 text-decoration-underline"
                  @click="login('')"
                >
                  Sign in
                </v-btn>
                or
                <v-btn
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

          <!-- Main hero card -->
          <v-card class="main-card mb-6" elevation="3" rounded="lg">
            <v-card-title primary-title class="justify-center py-6">
              <h1 class="text-h3 font-weight-bold primary--text">
                Teach MATH online with
                <span class="text-orange">Mathboard</span>
              </h1>
            </v-card-title>
            <v-card-actions class="justify-center pb-6">
              <v-btn
                v-if="!userStore.getCurrentUser()"
                color="orange"
                size="x-large"
                elevation="2"
                rounded
                class="px-8"
                v-on:click="login"
              >
                Get Started
                <v-icon end class="ml-2">mdi-arrow-right</v-icon>
              </v-btn>
              <v-btn
                v-if="userStore.isTeacher()"
                color="orange"
                size="x-large"
                elevation="2"
                rounded
                class="px-8"
                v-on:click="navToLessons"
              >
                Open or create a lesson
                <v-icon end class="ml-2">mdi-pencil</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>

          <!-- Features card -->
          <v-card class="features-card" elevation="2" rounded="lg">
            <v-card-title class="text-h4 font-weight-medium text-center py-4">
              Key Features
            </v-card-title>
            <v-list class="justify-center pa-4">
              <v-list-item v-for="b in bullets" :key="b" class="mb-2">
                <v-list-item-title class="d-flex align-center">
                  <v-icon color="success" class="mr-4" size="large">
                    mdi-check-circle
                  </v-icon>
                  <span class="text-h6">{{ b }}</span>
                </v-list-item-title>
              </v-list-item>
            </v-list>

            <!-- Tutorial button -->
            <v-card-actions class="justify-center pa-6">
              <v-btn
                color="primary"
                size="x-large"
                prepend-icon="mdi-play-circle"
                href="/tutorials/MathBoard tutorial.mp4"
                target="_blank"
                elevation="2"
                rounded
                class="tutorial-btn"
              >
                Watch Quick Tutorial
                <v-icon
                  end
                  icon="mdi-open-in-new"
                  size="small"
                  class="ml-2"
                ></v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import LoginDialog from "./Login.vue";
import RegisterStudentDialog from "./RegisterStudent.vue";
import RegisterTeacherDialog from "./RegisterTeacher.vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../store/pinia/userStore";

const router = useRouter();
const userStore = useUserStore();

function register(studentLink: boolean, redirectAfterLogin: string) {
  if (studentLink) {
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

function login(redirectAfterLogin: string) {
  router.push({
    name: "login",
    query: { from: redirectAfterLogin },
  });
}

function navToLessons() {
  router.push("/lessons");
}

const bullets = [
  "Editable notations",
  "Board sharing with students",
  "Virtually call a student to the board",
  "Dispatch exercises and submit feedback",
];
</script>

<style scoped>
.welcome-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
  min-height: 100vh;
  padding: 2rem 0;
}

.main-card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  max-width: 900px;
  margin: 0 auto;
}

.features-card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
}

.auth-card {
  background: transparent;
  max-width: 600px;
  margin: 0 auto;
}

.tutorial-btn {
  transition: transform 0.2s;
}

.tutorial-btn:hover {
  transform: scale(1.05);
}

.v-list-item__content {
  justify-content: center !important;
  text-align: left !important;
  display: grid !important;
}

/* Add subtle hover effect to buttons */
.v-btn {
  transition: all 0.2s ease;
}

.v-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}
</style>
