<template>
  <!-- <loginDialog :dialog="showLoginDialog" @register="register"></loginDialog> -->
  <loginDialog @register="register"></loginDialog>
  <registerDialog @registered="login"></registerDialog>
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
import RegisterDialog from "./Register.vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../store/pinia/userStore";

const router = useRouter();
const userStore = useUserStore();

const props = defineProps({
  login: Boolean,
});

function login() {
  router.push("/login");
}

function navToLessons() {
  router.push("/lessons");
}

function register() {
  router.push({
    name: "register",
    query: { userType: userStore.getCurrentUser()?.userType },
  });
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
