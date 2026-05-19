<template>
  <v-app id="app">
    <AppBar @show-feedback="showFeedbackDialog = true"></AppBar>

    <GlobalAlert></GlobalAlert>
    <router-view></router-view>

    <!-- Contact dialogs -->
    <ContactUs v-model="showFeedbackDialog" title="Send Feedback"></ContactUs>
    <ContactUs v-model="showContactUsDialog" title="Contact Us"></ContactUs>

    <Footer @show-contact-us="showContactUsDialog = true"></Footer>
  </v-app>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref } from "vue";
import { onMounted } from "vue";
import useAxiosHelper from "./helpers/axiosHelper";
import { restoreSessionFromCookie } from "./composables/restoreSession";
import { useUserStore } from "./store/pinia/userStore";
import { useTitleStore } from "./store/pinia/titleStore";
import { useEditModeStore } from "./store/pinia/editModeStore";
import { useStudentStore } from "./store/pinia/studentStore";
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
const titleStore = useTitleStore();
const editModeStrore = useEditModeStore();
const studentStore = useStudentStore();

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
</style>
