<template>
  <v-app id="app" full-height>
    <v-app-bar
      style="max-height: 80px; padding-right: 30px"
      color="primary"
      dark
      dense
      elevation="8"
    >
      <v-img
        class="mx-2"
        src="./assets/beta.png"
        max-height="35"
        max-width="35"
        contain
      ></v-img>

      <v-img
        class="mx-2"
        src="./assets/logo.png"
        max-height="65"
        max-width="85"
        contain
      ></v-img>
      <v-toolbar-title>
        ONLINE <strong style="color: darkorange">MATHBOARD</strong>
      </v-toolbar-title>

      <!-- lessons -->
      <v-tooltip text="Lessons" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn
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

      <!-- sign in / register -->
      <v-tooltip text="Sign in" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            v-show="!user"
            icon
            v-on:click="showLoginDialog()"
          >
            <v-icon>mdi-account</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <v-divider class="mx-6" vertical></v-divider>

      <!-- <v-btn v-show="!user" icon v-on:click="showRegisterDialog()">
        <v-icon>mdi-account-outline</v-icon>
        <span style="font-size: 0.7em">Register</span>
      </v-btn> -->

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
      <router-view></router-view>
    </v-main>

    <v-footer color="primary" padless dense style="max-height: 60px">
      <v-col class="text-center" cols="12">
        <p style="color: white">© Copyright 2024 www.mathboard.com</p>
      </v-col>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { onMounted, computed } from "vue";
import useAxiosHelper from "./helpers/axiosHelper";
import { useUserStore } from "./store/pinia/userStore";

import { useCookies } from "vue3-cookies";
const cookies = useCookies().cookies;

const { initAxiosInterceptors } = useAxiosHelper();
const router = useRouter();
const userStore = useUserStore();

onMounted(() => {
  initAxiosInterceptors();
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

const isTeacher = computed(() => userStore.isTeacher());

function showLoginDialog() {
  router.replace("/login");
}

function signOut() {
  userStore.setCurrentUser(null);
  cookies.remove("access_token");
  router.push("/");
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

// signInViaGoogleAuth: async function () {
//   let user = await authGoogleUser(googleUser);
//   if (!!user) {
//     return await setUser(user);
//   } else {
//     return await registerUser(...googleUser);
//   }
// },
</script>
<style>
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
  overflow-x: visible;
  overflow-y: visible;
}
</style>
