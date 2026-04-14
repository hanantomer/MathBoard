<template>
  <v-dialog v-model="show" max-width="600" persistent>
    <v-card>
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
                @keydown.enter="onLogin"
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
                @click="onLogin"
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
          <v-divider class="my-6">
            <span class="text-caption text-medium-emphasis">OR</span>
          </v-divider>
          <v-card-text>
            <GoogleLogin :callback="googleLoginCallback" />
          </v-card-text>
        </v-form>
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
import useApiHelper from "../helpers/apiHelper";
import useValidationRules from "../composables/validationRules";
import useGoogleLogin from "../composables/googleLogin";
import { ACCESS_TOKEN_NAME } from "common/globals";
import { UserType } from "common/unions";
import { UserAttributes, UserCreationAttributes } from "common/userTypes";

const cookies = useCookies().cookies;
const authHelper = useAuthHelper();
const apiHelper = useApiHelper();
const { rules } = useValidationRules();
const { handleGoogleAuth, decodeGoogleCredential } =
  useGoogleLogin();
const userStore = useUserStore();

const router = useRouter();
const route = useRoute();

let loginForm = ref();
let loginFailed = ref(false);
let show = ref(false);
let valid = ref<boolean>(false);

let password = ref<string>();
let email = ref<string>();

let redirectAfterLogin: string = "";
let resetEmailSent = ref(false);

let studentLogin = false;

const emit = defineEmits(["register"]);

let userType: UserType | null = null;

watch(
  route,
  (params) => {
    show.value = false;
    if (params.name === "login") {
      show.value = true;
      // Check userType query parameter first
      userType = params.query?.userType?.toString() as UserType;
      if (userType === "STUDENT") {
        studentLogin = true;
      } else if (userType === "TEACHER") {
        studentLogin = false;
      } else {
        // Fallback to existing logic for link based detection
        studentLogin =
          params.query?.from?.toString().indexOf("/lesson/sl_") === 0;
        userType = studentLogin ? "STUDENT" : null;
      }
      redirectAfterLogin = params.query?.from?.toString() || "";
    }
  },
  { flush: "pre", immediate: true },
);

function register() {
  show.value = false;
  emit("register", studentLogin, redirectAfterLogin);
}

async function googleLoginCallback(response: any) {
  try {
    const ticket = await handleGoogleAuth(response.credential);
    if (!ticket) return;

    let storedUser = await authHelper.handleGoogleUserRegistration(response, userType!);

    await completeLogin(storedUser!);

    handleRedirect();
  } catch (error) {
    console.error("Google login failed:", error);
    loginFailed.value = true;
  }
}

async function completeLogin(user: UserAttributes) {
  userStore.setCurrentUser(user);
  userStore.setLoginAsStudent(user.userType === "STUDENT" || studentLogin);

  show.value = false;
}

function handleRedirect() {
  if (route.query.from) {
    const routeFrom: RouteLocationRaw = route.query.from as string;
    router.replace(routeFrom);
  } else {
    router.push("/lessons");
  }
}

async function onLogin() {
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

  // Handle user type logic
  if (studentLogin) {
    if (authenticatedUser.userType === "TEACHER") {
      // Register as student to merge userType to BOTH
      const userToRegister: UserCreationAttributes = {
        firstName: authenticatedUser.firstName,
        lastName: authenticatedUser.lastName,
        email: authenticatedUser.email,
        password: password.value!,
        userType: "STUDENT",
        imageUrl: authenticatedUser.imageUrl,
        approved: authenticatedUser.approved,
        access_token: null,
        reset_pasword_token: null,
      };
      try {
        await apiHelper.registerUser(userToRegister);
        // Re-authenticate to get updated user
        authenticatedUser = await authHelper.authLocalUserByUserAndPassword(
          email.value!,
          password.value!,
        );
        if (!authenticatedUser) {
          loginFailed.value = true;
          return;
        }
        cookies.set(ACCESS_TOKEN_NAME, authenticatedUser.access_token!);
      } catch (error) {
        loginFailed.value = true;
        return;
      }
    }
  } else {
    // Not student login
    if (
      authenticatedUser.userType !== "TEACHER" &&
      authenticatedUser.userType !== "BOTH"
    ) {
      loginFailed.value = true;
      return;
    }
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

  completeLogin(authenticatedUser);
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
