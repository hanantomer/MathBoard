<template>
    <login :dialog = showLoginDialog
    ></login>
    <Register :dialog = showRegisterDialog
    ></Register>

    <v-main>

    <v-row>
      <v-col class="text-center" cols="12">
        <v-card flat>
          <v-card-title primary-title class="justify-center">
            <h3>Teach MATH online with Mathboard</h3>
          </v-card-title>
          <v-card-actions class="justify-center">
            <v-btn color="orange" v-on:click="showLoginDialog=true"
              >Get Started</v-btn
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
import { ref,watch } from "vue";
import Login from "./Login.vue";
import Register from "./Register.vue";
import { useRoute } from 'vue-router'
import useEventBus from "../helpers/eventBus";
const eventBus = useEventBus();
const route = useRoute();

let showLoginDialog = ref(false);
let showRegisterDialog = ref(false);

const props = defineProps({
  login: Boolean
});

watch(route, (to) => {
  if (props.login) {
    showLoginDialog.value = true;
  }}, {flush: 'pre', immediate: true, deep: true})

// login via button
//watch(() => eventBus.bus.value.get("login"), () => {
//  showLoginDialog.value = true;
//});

watch(() => eventBus.bus.value.get("register"), () => {
  showLoginDialog.value = false;
  showRegisterDialog.value = true;
});

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
