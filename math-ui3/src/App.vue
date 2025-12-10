<template>
  <v-app id="app">
    <v-app-bar app color="primary" dark dense elevation="8">
      <v-img
        class="mx-2"
        src="./assets/beta.png"
        max-height="35"
        max-width="35"
        contain
        style="max-width: 35px; width: 100%; height: auto"
      ></v-img>
      <v-img
        class="mx-2"
        src="./assets/logo.png"
        max-height="65"
        max-width="85"
        contain
      ></v-img>
      <v-toolbar-title>
        ONLINE <strong style="color: darkorange">MATHBOARD </strong>
        <span class="title">{{ title }}</span>
      </v-toolbar-title>

      <!-- lessons -->
      <v-tooltip text="Lessons" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn
            data-cy="lessons"
            v-show="showLessons"
            icon
            v-on:click="navToLessons"
            v-bind="props"
          >
            <v-icon>mdi-archive-edit-outline</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <!-- questions -->
      <v-tooltip text="Questions" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn
            v-show="showQuestions"
            icon
            v-on:click="navToQuestions"
            v-bind="props"
          >
            <v-icon>mdi-message-question-outline</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <!-- answers -->
      <v-tooltip text="Answers" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn
            v-show="showAnswers"
            icon
            v-on:click="navToAnswers"
            v-bind="props"
          >
            <v-icon>mdi-checkbox-marked-outline</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <!-- students -->
      <v-tooltip text="Online Students" location="bottom">
        <template v-slot:activator="{ props }">
          <v-badge
            :content="onlineStudentsCount"
            :model-value="onlineStudentsCount > 0"
            color="green"
            overlap
          >
            <v-tooltip text="Online Students" location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-show="showOnlineStudents"
                  icon
                  v-on:click="showOnlineStudentsDialog"
                  v-bind="props"
                >
                  <v-icon>mdi-account-school-outline</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </v-badge>
        </template>
      </v-tooltip>

      <!-- sign in / register -->
      <v-tooltip text="Sign in" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            v-show="!user"
            icon
            v-on:click="showLoginDialog"
          >
            <v-icon>mdi-account</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <v-divider class="mx-6" vertical></v-divider>

      <!-- user image or name -->
      <v-tooltip bottom hidden>
        <template v-slot:activator="{ props }">
          <v-avatar v-show="user?.imageUrl" size="36px"
            ><img v-bind:src="user?.imageUrl"
          /></v-avatar>
        </template>
        <span v-show="user?.firstName">{{ user?.firstName }}</span>
      </v-tooltip>

      <span v-show="user?.firstName && !user?.imageUrl"
        >Hello {{ user?.firstName }}</span
      >

      <v-tooltip text="Sign Out" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn v-show="user" icon v-on:click="signOut" v-bind="props">
            <v-icon>mdi-logout</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </v-app-bar>

    <v-main>
      <GlobalAlert></GlobalAlert>
      <router-view></router-view>
    </v-main>

    <v-footer color="primary" padless dense app>
      <v-row justify="center" no-gutters>
        <v-col cols="12" sm="auto" class="text-center">
          <p style="color: whitesmoke; margin-right: 10px">
            © Copyright 2025 www.themathboard.com
          </p>
        </v-col>
        <v-col cols="12" sm="auto" class="text-center">
          <v-btn
            style="background-color: transparent; color: whitesmoke"
            class="ml-1"
            height="25"
            flat
            href="/privacyPolicy.html"
            target="_blank"
          >
            Privacy Policy
          </v-btn>

          <v-btn
            style="background-color: transparent; color: whitesmoke"
            class="ml-1"
            height="25"
            flat
            href="/tutorials/MathBoard tutorial.mp4"
            target="_blank"
          >
            Tutorial
          </v-btn>

          <v-btn
            style="background-color: transparent; color: whitesmoke"
            class="ml-1"
            height="25"
            flat
            v-on:click="navContactUs"
          >
            Contact Us
          </v-btn>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { onMounted, computed } from "vue";
import useAxiosHelper from "./helpers/axiosHelper";
import { useUserStore } from "./store/pinia/userStore";
import { useTitleStore } from "./store/pinia/titleStore";
import { useEditModeStore } from "./store/pinia/editModeStore";
import { useStudentStore } from "./store/pinia/studentStore";
import { useCookies } from "vue3-cookies";
import { ACCESS_TOKEN_NAME } from "../../math-common/src/globals";
import GlobalAlert from "./components/GlobalAlert.vue";

const cookies = useCookies().cookies;
const { initAxiosInterceptors } = useAxiosHelper();
const router = useRouter();
const userStore = useUserStore();
const titleStore = useTitleStore();
const editModeStrore = useEditModeStore();
const studentStore = useStudentStore();

onMounted(() => {
  initAxiosInterceptors();
});

let onlineStudentsCount = computed(() => {
  return studentStore.getStudents().length;
})

let title = computed(() => {
  return titleStore.getTitle();
});

const user = computed(() => {
  return userStore.getCurrentUser();
});

const showLessons = computed(() => {
  return user;
});

const showQuestions = computed(() => {
  return userStore.getCurrentUser();
});

const showAnswers = computed(() => {
  return isTeacher.value;
});

const showOnlineStudents = computed(() => {
  return isTeacher.value;
});

const isTeacher = computed(() => userStore.isTeacher());

function showLoginDialog() {
  router.push("/login");
  //router.go(0);
}

function signOut() {
  userStore.setCurrentUser(null);
  cookies.remove(ACCESS_TOKEN_NAME);
  router.push("/");
}

function showOnlineStudentsDialog() {
  editModeStrore.setEditMode("STUDENTS_MONITORING");
}

function navToLessons() {
  router.push("/lessons");
}

function navToQuestions() {
  router.push("/questions");
}

function navToAnswers() {
  router.push("/answers");
}

function navContactUs() {
  router.push("/contactUs");
}
</script>
<style>

.title {
  margin-left: 20px !important;
}

body {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

text {
  text-anchor: start;
  cursor: pointer;
  text-anchor: middle;
}

html {
  overflow: auto;
}


</style>
