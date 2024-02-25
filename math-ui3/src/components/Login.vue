<template>
  <v-dialog v-model="show" persistent width="350">
    <v-card height="400">
      <!-- <v-card-title class="text-center" primary-title>Log In</v-card-title> -->
      <v-card-text>
        <v-form ref="loginForm" v-model="valid" lazy-validation>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="loginEmail"
                :rules="loginEmailRules"
                label="E-mail"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="loginPassword"
                :rules="[rules.required, rules.min]"
                :type="'password'"
                name="input-10-1"
                label="Password"
                hint="At least 8 characters"
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
                class="text-none mb-4"
                color="indigo-darken-3"
                size="x-large"
                variant="flat"
                @click="validateLogin"
              >
                Log In
              </v-btn>
            </v-col>
            <v-col class="d-flex text-start text-body2" cols="12">
              <span style="margin-right: 10px">don't have an account?</span>
              <v-btn
                data-cy="register"
                prepend-icon="mdi-account"
                v-on:click="register"
                size="x-small"
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
import useEventBus from "../helpers/eventBusHelper";

const eventBus = useEventBus();
const cookies = useCookies().cookies;
const authHelper = useAuthHelper();
const userStore = useUserStore();

const router = useRouter();
const route = useRoute();

let loginForm = ref();
let loginFailed = false;
let show = ref(false);
let valid = true;

let loginPassword = "12345678"; ///TODO remove those magic values
let loginEmail = "hanantomer@gmail.com";
let loginEmailRules = [
  (v: string) => v || "Required",
  (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid",
];
let show1 = ref(false);
let rules = {
  required: (value: string) => !!value || "Required.",
  min: (v: string) => (v && v.length >= 8) || "Min 8 characters",
};

const props = defineProps({
  dialog: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["register"]);

watch(
  () => props.dialog,
  (val: boolean) => {
    show.value = val;
  },
  { flush: "pre", immediate: true, deep: true },
);

function register() {
  emit("register");
}

//mounted() {
//    if (!show) show = true;
/*    gapi.signin2.render("google-signin-btn", {
      scope: "email",
      longtitle: true,
      theme: "dark",
      onsuccess: googleOnSuccess,
    });*/
// if (dialog) {
//   show = true;
// }
//},
function googleOnSuccess() {
  show.value = false;
  cookies.remove("access_token");
}

async function validateLogin() {
  let formVlidated: any = await (loginForm.value as any).validate();
  if (!formVlidated) {
    return;
  }

  let authenticatedUser = await authHelper.authLocalUserByUserAndPassword(
    loginEmail,
    loginPassword,
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

  router.push({ path: "/lessons" });
}
</script>
<style>
.alerttext input {
  color: red !important;
}
</style>
