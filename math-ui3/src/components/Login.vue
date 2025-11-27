<template>
  <v-dialog v-model="show" max-width="600" persistent>
    <v-card>
      <v-card-text>
        <GoogleLogin :callback="googleLoginCallback" />
      </v-card-text>
      <v-card-text>
        <v-form ref="loginForm" v-model="valid" lazy-validation>
          <v-row>
            <v-col cols="11"></v-col>
            <v-col cols="1">
              <v-btn
                data-cy="close_login"
                density="compact"
                icon="mdi-window-close"
                @click="close"
              ></v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="11">
              <v-text-field
                data-cy="login_email"
                v-model="email"
                :rules="[rules.validMail]"
                label="E-mail"
                required
                aria-autocomplete="both"
              ></v-text-field>
            </v-col>
            <v-col cols="11">
              <v-text-field
                data-cy="login_password"
                v-model="password"
                :rules="[rules.required, rules.min]"
                :type="'password'"
                name="input-10-1"
                label="Password"
                hint="At least 8 characters"
                @keydown.enter="validateLogin"
                aria-autocomplete="both"
                counter
              ></v-text-field>
              <v-btn
                variant="text"
                density="compact"
                class="mt-1"
                @click="forgotPassword"
                data-cy="forgot_password"
              >
                Forgot Password?
              </v-btn>
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
              <!-- <v-text-field
                class="alerttext"
                prepend-icon="mdi-account-alert"
                v-if="userNotApproved"
                color="#F44336"
                readonly
                outlined
                value="Your account is pending approval. We'll inform you once it's approved."
                prepend-inner-icon="mdi-error"
              ></v-text-field> -->
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
            <v-col cols="5">
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
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useCookies } from "vue3-cookies";
import { decodeCredential } from "vue3-google-login";
import { useRouter, useRoute, RouteLocationRaw } from "vue-router";
import { useUserStore } from "../store/pinia/userStore";
import useAuthHelper from "../helpers/authenticationHelper";
import useApiHelper from "../helpers/apiHelper";
import { ACCESS_TOKEN_NAME } from "common/globals";

const cookies = useCookies().cookies;
const authHelper = useAuthHelper();
const apiHelper = useApiHelper();
const userStore = useUserStore();

const router = useRouter();
const route = useRoute();

let loginForm = ref();
let loginFailed = ref(false);
//let userNotApproved = ref(false);
let show = ref(false);
let valid = ref<boolean>(false);

let password = ref<string>();
let email = ref<string>();

let redirectAfterLogin: string = "";
let resetEmailSent = ref(false);

let studentLink = false;

let rules = {
  required: (value: string) => !!value || "Required.",
  min: (v: string) => (v && v.length >= 8) || "Min 8 characters",
  validMail: (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid",
};

const emit = defineEmits(["register"]);

watch(
  route,
  (params) => {
    show.value = false;
    if (params.name === "login") {
      show.value = true;
      studentLink = params.query?.from?.toString().indexOf("/lesson/sl_") === 0;
      redirectAfterLogin = params.query?.from?.toString() || "";
    }
  },
  { flush: "pre", immediate: true },
);

function register() {
  show.value = false;
  emit("register", studentLink, redirectAfterLogin);
}

async function googleLoginCallback(response: any) {
  try {
    const ticket = await handleGoogleAuth(response.credential);
    if (!ticket) return;

    const userData = decodeCredential(response.credential) as GoogleUserData;

    const storedUser = await handleGoogleUserRegistration(
      userData,
      ticket,
      studentLink,
    );
    if (!storedUser) {

      return;
    }

    // check that user is approved
    //if (!(await handleUserValidation(storedUser))) return;

    await completeLogin(storedUser);

    handleRedirect();
  } catch (error) {
    console.error("Google login failed:", error);
    loginFailed.value = true;
  }
}

interface GoogleUserData {
  sub: string;
  name: string;
  email: string;
}

async function handleGoogleAuth(accessToken: string) {
  const ticket = await authHelper.authGoogleUser(accessToken);
  if (!ticket) {
    loginFailed.value = true;
    return null;
  }
  return ticket;
}

async function handleGoogleUserRegistration(
  userData: GoogleUserData,
  ticket: any,
  isStudentLink: boolean,
) {
  if (!validateCookiesEnabled()) return null;

  // will be used later for subsequent api calls
  cookies.set(ACCESS_TOKEN_NAME, ticket);

  let storedUser = await authHelper.getUserByEmail(userData.email);
  if (!storedUser) {
    storedUser = await registerNewUser(userData, isStudentLink);
  }

  if (!storedUser) {
    loginFailed.value = true;
    return null;
  }

  return storedUser;
}

function validateCookiesEnabled(): boolean {
  if (!window.navigator.cookieEnabled) {
    alert("Cookies not enabled. You must enable cookies to continue");
    return false;
  }
  return true;
}

async function registerNewUser(
  userData: GoogleUserData,
  isStudentLink: boolean,
): Promise<any> {
  try {
    const newUser = await authHelper.registerUser(
      userData.name,
      "",
      userData.email,
      "",
      isStudentLink ? "STUDENT" : "TEACHER",
    );

    return newUser;
  } catch (error) {
    console.error("User registration failed:", error);
    return null;
  }
}

async function handleUserValidation(user: any) {
  // if (user.approved === false && user.userType === "TEACHER") {
  //   userNotApproved.value = true;
  //   return false;
  // }

  //userNotApproved.value = false;
  loginFailed.value = false;
  return true;
}

async function completeLogin(user: any) {
  userStore.setCurrentUser(user);
  show.value = false;
}

function handleRedirect() {
  if (route.query.from) {
    const routeFrom: RouteLocationRaw = route.query.from as string;
    router.replace(routeFrom);
  }
}

async function validateLogin() {
  if (!email) return;
  if (!password) return;

  let formVlidated: any = (loginForm.value as any).validate();
  if (!formVlidated) {
    return;
  }

  let authenticatedUser = null;

  try {
    authenticatedUser = await authHelper.authLocalUserByUserAndPassword(
      email.value!,
      password.value!,
    );
  } catch (error) {
    throw new Error(`Error during login validation: ${error}`);
  }

  if (!authenticatedUser) {
    loginFailed.value = true;
    return;
  }

  if (!authenticatedUser.access_token) {
    apiHelper.log(
      `No access token received during authentication for user: ${email} `,
    );
    loginFailed.value = true;
    return;
  }

  loginFailed.value = false;

  //if (
  //  authenticatedUser.approved === false &&
  //  authenticatedUser.userType === "TEACHER"
  //) {
    //userNotApproved.value = true;
    //return;
  //}

  //userNotApproved.value = false;
  loginFailed.value = false;

  userStore.setCurrentUser(authenticatedUser);

  if (window.navigator.cookieEnabled) {
    cookies.set(ACCESS_TOKEN_NAME, authenticatedUser.access_token);
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

function close() {
  show.value = false;
  router.push("/");
}

async function forgotPassword() {
  if (!email?.value) {
    alert("Please enter your email address first");
    return;
  }

  try {
    await authHelper.sendPasswordResetEmail(email.value);
    resetEmailSent.value = true;
    alert("Password reset email has been sent. Please check your inbox.");
  } catch (error) {
    console.error("Failed to send reset email:", error);
    alert("Failed to send reset email. Please try again later.");
  }
}
</script>
<style>
.alerttext input {
  color: red !important;
  font-size: small;
}
</style>

