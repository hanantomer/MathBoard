<template>
  <v-dialog v-model="show" max-width="500" persistent>
    <v-card height="400">
      <v-card-text>
        <v-form ref="loginForm" v-model="valid" lazy-validation>
          <v-row>
            <v-col cols="12">
              <v-text-field
                data-cy="login_email"
                v-model="email"
                :rules="[rules.validMail]"
                label="E-mail"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                data-cy="login_password"
                v-model="password"
                :rules="[rules.required, rules.min]"
                :type="'password'"
                name="input-10-1"
                label="Password"
                hint="At least 8 characters"
                @keydown.enter="validateLogin"
                counter
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-text-field
                class="alerttext"
                prepend-icon="mdi-account-alert"
                v-if="loginFailed"
                color="#F44336"
                readonly
                outlined
                value="Invalid email or password"
                prepend-inner-icon="mdi-error"
              ></v-text-field>
            </v-col>

            <v-col class="d-flex" cols="12" align-end>
              <v-btn
                data-cy="login"
                class="text-none mb-4"
                color="indigo-darken-3"
                size="x-large"
                variant="flat"
                @click="validateLogin"
              >
                Log In
              </v-btn>
            </v-col>
            <v-col cols="6">
              <span>don't have an account?</span>
            </v-col>
            <v-col class="d-flex text-start text-body2" cols="6">
              <v-btn
                data-cy="register"
                prepend-icon="mdi-account"
                v-on:click="register"
                >Sign Up</v-btn
              >
            </v-col>
          </v-row>
        </v-form>
        <div class="g-signin2" id="google-signin-btn"></div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useCookies } from "vue3-cookies";
import { useRouter, useRoute, RouteLocationRaw } from "vue-router";
import { useUserStore } from "../store/pinia/userStore";
import useAuthHelper from "../helpers/authenticationHelper";

const cookies = useCookies().cookies;
const authHelper = useAuthHelper();
const userStore = useUserStore();

const router = useRouter();
const route = useRoute();

let loginForm = ref();
let loginFailed = false;
let show = ref(false);
let valid = true;

let password = ref<string>();
let email = ref<string>();

let redirectAfterLogin: string = "";

let rules = {
  required: (value: string) => !!value || "Required.",
  min: (v: string) => (v && v.length >= 8) || "Min 8 characters",
  validMail: (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid",
};

const props = defineProps({
  dialog: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["register"]);

watch(
  route,
  (params) => {
    if (params.name === "login") {
      show.value = true;
      redirectAfterLogin = params.query?.from?.toString() || "";
    }
  },
  { flush: "pre", immediate: true },
);

function register() {
  show.value = false;
  emit("register", redirectAfterLogin);
}

/*
function googleOnSuccess() {
  show.value = false;
  cookies.remove("access_token");
}
  */

async function validateLogin() {
  if (!email) return;
  if (!password) return;
  let formVlidated: any = await (loginForm.value as any).validate();
  if (!formVlidated) {
    return;
  }

  let authenticatedUser = await authHelper.authLocalUserByUserAndPassword(
    email.value!,
    password.value!,
  );

  if (!authenticatedUser) {
    loginFailed = true;
    return;
  }

  loginFailed = false;

  userStore.setCurrentUser(authenticatedUser);

  if (window.navigator.cookieEnabled) {
    cookies.set("access_token", authenticatedUser.access_token);
  } else {
    alert("cookies not enabled. you must enable cookies to continue");
  }
  loginForm.value = null;

  if (route.query.from) {
    let routeFrom: RouteLocationRaw = route.query.from as string;
    router.replace(routeFrom);
    return;
  }

  show.value = false;
}
</script>
<style>
.alerttext input {
  color: red !important;
}
</style>
