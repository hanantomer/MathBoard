<template>
  <v-dialog v-model="show" persistent width="600" height="600">
    <v-card  height="350">
      <v-card-title color="light-greeen">
        <span class="text-h5">Sign In</span>
      </v-card-title>
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
                :append-icon="show1 ? 'eye' : 'eye-off'"
                :rules="[rules.required, rules.min]"
                :type="show1 ? 'text' : 'password'"
                name="input-10-1"
                label="Password"
                hint="At least 8 characters"
                value="12345678"
                counter
                @click:append="show1 = !show1"
              ></v-text-field>
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
            <v-col class="d-flex" cols="12" sm="6" xsm="12"> </v-col>
            <v-spacer></v-spacer>
            <v-col class="d-flex" cols="12" sm="3" xsm="12" align-end>
              <v-btn
                x-large
                block
                color="grey-lighten-3"
                @click="validateLogin"
              >
                Sign In
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
        <div class="g-signin2" id="google-signin-btn"></div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import useAuthHelper from "../helpers/authHelper";
import { ref, watch } from "vue";
import { useCookies } from "vue3-cookies";
import { useRouter, useRoute, RouteLocationRaw } from "vue-router";


const cookies = useCookies().cookies;
const authHelper = useAuthHelper();

const router = useRouter();
const route = useRoute();

let loginForm = ref();
let loginFailed = false;
let show = false;
let valid = true;

let loginPassword = "12345678"; ///TODO remove those magic values
let loginEmail = "hanantomer@gmail.com";
let loginEmailRules = [
  (v: string) => v || "Required",
  (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid",
];
let show1 = false;
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

watch(() => props.dialog, (val) => { show = val });

//watch(route, (to) => {
//    show = true;
//  });


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
  show = false;
  cookies.remove("access_token");
}


async function validateLogin() {
  let formVlidated: any = await (loginForm.value as any).validate();
  if (!formVlidated) {
    return;
  }

  let authenticatedUser = await authHelper.authLocalUserByUserAndPassword(
    loginEmail,
    loginPassword
  );

  if (!authenticatedUser) {
    loginFailed = true;
    return;
  }

  loginFailed = false;

  authHelper.setUser(authenticatedUser);

  if (window.navigator.cookieEnabled) {
    cookies.set("access_token", authenticatedUser.access_token);
  }
  loginForm.value = null;

  if (route.query.from) {
    let r: RouteLocationRaw = route.query.from as string;
    router.replace(r);
  }
}
</script>
<style>
.alerttext input {
  color: red !important;
}
</style>
