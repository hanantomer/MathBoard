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

      <v-spacer></v-spacer>

      <!-- lessons -->
      <v-tooltip bottom hidden>
        <template v-slot:activator="{ props }">
          <v-btn
            v-show="user"
            icon
            v-on:click="navToLessons"
          >
            <v-icon>mdi-archive-edit-outline</v-icon>
          </v-btn>
        </template>
        <span>Lessons</span>
      </v-tooltip>

      <!-- questions -->
      <v-tooltip bottom hidden>
        <template v-slot:activator="{ props }">
          <v-btn v-show="user" icon v-on:click="navToQuestions">
            <v-icon>mdi-message-question-outline</v-icon>
          </v-btn>
        </template>
        <span>Questions</span>
      </v-tooltip>

      <!-- answers -->
      <v-tooltip bottom hidden>
        <template v-slot:activator="{ props }">
          <v-btn v-show="isTeacher" icon  v-on:click="navToAnswers">
            <v-icon>mdi-checkbox-marked-outline</v-icon>
          </v-btn>
        </template>
        <span>Answers</span>
      </v-tooltip>

      <!-- sign in / register -->
      <v-btn v-show="!user" icon v-on:click="showLoginDialog()">
        <v-icon>mdi-account</v-icon>
        <span style="font-size: 0.7em">Sign In</span>
      </v-btn>

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

      <v-tooltip bottom hidden>
        <template v-slot:activator="{ props }">
          <v-btn
            v-show="user"
            icon
            v-on:click="signOut"
          >
            <v-icon>mdi-logout</v-icon>
          </v-btn>
        </template>
        <span>Sign Out</span>
      </v-tooltip>
    </v-app-bar>
    <v-container no-gutters fluid class="fill-height">
      <router-view></router-view>
    </v-container>
    <v-footer color="primary" padless dense>
      <v-col class="text-center" cols="12">
        <p style="color: white">© Copyright 2023 www.mathboard.com</p>
      </v-col>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, onUnmounted, watch } from "vue";
import useAuthHelper from "./helpers/authHelper";
import useEventBus from "./helpers/eventBus";
import useAxiosHelper from "./helpers/axiosHelper";
import { useUserStore } from "./store/pinia/userStore";
import { computed } from 'vue';

const { initAxiosInterceptors } = useAxiosHelper();
const router = useRouter();
const eventBus = useEventBus();
const authHelper = useAuthHelper();
const userStore = useUserStore();

onMounted(() => {
  initAxiosInterceptors();
  window.addEventListener("keyup", onKeyUp);
  document.addEventListener("paste", onPaste);
});

onUnmounted(() => {
  window.removeEventListener("keyup", onKeyUp);
  document.removeEventListener("paste", onPaste);
});

const user = computed(() => userStore.currentUser);
const isTeacher  = computed(() => userStore.isTeacher);

function showLoginDialog() {
  router.push("/login");
};


function onKeyUp (key: KeyboardEvent) {
  eventBus.emit("keyup", key);
};

function onPaste(e: ClipboardEvent) {
  eventBus.emit("paste", e);
};

function signOut() {
  authHelper.signOut();
  router.push("/");
};

function navToLessons() {
  router.push("/lessons");
};

function navToQuestions() {
  router.push("/questions");
};

function navToAnswers() {
  router.push("/answers");
};

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
</style>
