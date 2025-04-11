<template>
  <LoginDialog @register="registerStudent"></LoginDialog>
  <RegisterTeacherDialog @registered="login"></RegisterTeacherDialog>
  <RegisterStudentDialog @registered="login"></RegisterStudentDialog>
  <v-main>
    <v-row>
      <v-col class="text-center" cols="12">
        <v-card flat>
          <v-card-title primary-title class="justify-center">
            <h3>Teach MATH online with Mathboard</h3>
          </v-card-title>
          <v-card-actions class="justify-center">
            <v-btn
              v-if="!userStore.getCurrentUser()"
              color="orange"
              v-on:click="login"
              >Get Started</v-btn
            >
            <v-btn
              v-if="userStore.getCurrentUser()"
              color="orange"
              v-on:click="navToLessons"
              >Open or create a lesson</v-btn
            >
          </v-card-actions>
        </v-card>
        <v-card flat class="justify-center">
          <v-list class="justify-center">
            <v-list-item v-for="b in bullets" :key="b">
              <v-list-item-title>
                <v-icon>mdi-check</v-icon>
                {{ b }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
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


function registerStudent(redirectAfterLogin: string) {
  router.push({
    name: "registerStudent",
    query: { from: redirectAfterLogin },
  });
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
<style>
.v-list-item__content {
  justify-content: center !important;
  text-align: left !important;
  display: grid !important;
}
</style>
