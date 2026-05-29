<template>
  <v-app id="app">
    <AppBar @show-feedback="showFeedbackDialog = true"></AppBar>

    <GlobalAlert></GlobalAlert>
    <router-view></router-view>

    <!-- Contact dialogs -->
    <ContactUs v-model="showFeedbackDialog" title="Send Feedback"></ContactUs>
    <ContactUs v-model="showContactUsDialog" title="Contact Us"></ContactUs>

    <Footer @show-contact-us="showContactUsDialog = true"></Footer>

    <v-snackbar
      v-model="studentJoinSnackbar"
      :timeout="6000"
      color="success"
      location="top"
    >
      {{ studentJoinSnackbarText }}
      <template #actions>
        <v-btn variant="text" @click="studentJoinSnackbar = false">Dismiss</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref } from "vue";
import { onMounted } from "vue";
import useAxiosHelper from "./helpers/axiosHelper";
import { restoreSessionFromCookie } from "./composables/restoreSession";
import { useUserStore } from "./store/pinia/userStore";
import { useBoardDocumentTitle } from "./composables/useBoardDocumentTitle";
import { useEditModeStore } from "./store/pinia/editModeStore";
import { useStudentJoinNotifications } from "./composables/useStudentJoinNotifications";
import { useCookies } from "vue3-cookies";
import GlobalAlert from "./components/GlobalAlert.vue";
import ContactUs from "./components/ContactUs.vue";
import AppBar from "./components/AppBar.vue";
import Footer from "./components/Footer.vue";

import { defineAsyncComponent } from "vue";
const leftToolbar = defineAsyncComponent(
  () => import("./components/LeftToolbar.vue"),
);

const cookies = useCookies().cookies;
const { initAxiosInterceptors } = useAxiosHelper();
const router = useRouter();
const userStore = useUserStore();
useBoardDocumentTitle();
const editModeStrore = useEditModeStore();
const { snackbar: studentJoinSnackbar, snackbarText: studentJoinSnackbarText } =
  useStudentJoinNotifications();

onMounted(async () => {
  initAxiosInterceptors();
  await restoreSessionFromCookie();
});

const showFeedbackDialog = ref(false);
const showContactUsDialog = ref(false);
</script>
<style>
body {
  font-size: 16px;
  font-family: Roboto, "Helvetica Neue", Arial, sans-serif;
  font-weight: 400;
  color: #111;
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
  overflow-y: auto;
  overflow-x: auto;
}

@media (max-width: 1023px) {
  html,
  body {
    touch-action: manipulation;
    overscroll-behavior: none;
  }

  #app {
    min-height: 100dvh;
  }
}
</style>
