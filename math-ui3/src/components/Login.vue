<template>
  <v-dialog v-model="show" width="auto">
    <div>
      <v-tabs
        v-model="tab"
        show-arrows
        background-color="deep-purple accent-4"
        icons-and-text
        dark
        grow
      >
        <!-- <v-tabs-slider color="purple darken-4"></v-tabs-slider> -->
        <v-tab v-for="tab in tabs" :key="tab.name">
          <v-icon large>{{ tab.icon }}</v-icon>
          <div class="caption py-1">{{ tab.name }}</div>


          <v-card class="px-4">
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
                      :disabled="!valid"
                      color="success"
                      @click="validateLogin"
                    >
                      Login
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
              <div class="g-signin2" id="google-signin-btn"></div>
            </v-card-text>
          </v-card>
        </v-tab>
        <v-tab>
          <v-card class="px-4">
            <v-card-text>
              <v-form ref="registerForm" v-model="valid" lazy-validation  @submit.prevent>
                <v-row>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      v-model="firstName"
                      :rules="[rules.required]"
                      label="First Name"
                      maxlength="20"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      v-model="lastName"
                      :rules="[rules.required]"
                      label="Last Name"
                      maxlength="20"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="email"
                      :rules="emailRules"
                      label="E-mail"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="password"
                      :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                      :rules="[rules.required, rules.min]"
                      :type="show1 ? 'text' : 'password'"
                      name="input-10-1"
                      label="Password"
                      hint="At least 8 characters"
                      counter
                      @click:append="show1 = !show1"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      block
                      v-model="verify"
                      :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                      :rules="[rules.required, passwordMatch]"
                      :type="show1 ? 'text' : 'password'"
                      name="input-10-1"
                      label="Confirm Password"
                      counter
                      @click:append="show1 = !show1"
                    ></v-text-field>
                  </v-col>
                  <v-spacer></v-spacer>
                  <v-col class="d-flex ml-auto" cols="12" sm="3" xsm="12">
                    <v-btn
                      type="submit"
                      x-large
                      block
                      :disabled="!valid"
                      color="success"
                      @click="validateRegister"
                      >Register</v-btn
                    >
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
        </v-tab>
      </v-tabs>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { LoginType } from "../../../math-common/src/enum"
import useAuthHelper from "../helpers/authHelper";
import { ref, computed, watch } from "vue";
import { useCookies } from "vue3-cookies";
import { useRouter, useRoute, RouteLocationRaw } from 'vue-router'
import { PropType } from "vue";


const cookies = useCookies().cookies;
const authHelper = useAuthHelper();

const router = useRouter()
const route = useRoute()


const props = defineProps({
  dialog: {
    type: Boolean,
    default: false,
  },
  dialogType: {
    type: Object as PropType<LoginType>,
    default: LoginType.LOGIN,
  },
});

const loginForm = ref();
const registerForm = ref();

let loginFailed = false;
let tab = 0;
let show = false;
let tabs = [
  { name: "Login", icon: "mdi-account" },
  { name: "Register", icon: "mdi-account-outline" },
];
let valid = true;
let firstName = "";
let lastName = "";
let email = "";
let password = "";
let verify = "";
let loginPassword = "12345678";    ///TODO remove those magic values
let loginEmail = "hanantomer@gmail.com";
let loginEmailRules = [
  (v: string) => v || "Required",
  (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid",
];
let emailRules = [
  (v: string) => !!v || "Required",
  (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid",
];
let show1 = false;
let rules = {
  required: (value: string) => !!value || "Required.",
  min: (v: string) => (v && v.length >= 8) || "Min 8 characters",
};

const passwordMatch = computed(() => {
  return () => password === verify || "Password must match"
});

watch(() => props.dialog, (val) => { show = val });
watch(() => props.dialogType, (val) => { tab = val  === LoginType.LOGIN ? 0 : 1 });


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
};

function validateRegister() {
  if (registerForm.value.validate()) {
    authHelper.registerUser(firstName, lastName, email, password);
    registerForm.value = null;
    loginForm.value = null;
    tab = 0; /*redirect to login*/
  }
};

async function validateLogin() {
  if (loginForm.value.validate()) {
    let authenticatedUser = await authHelper.authLocalUserByUserAndPassword(
      loginEmail,
      loginPassword
    );

    if (authenticatedUser) {
      loginFailed = false;

      authHelper.setUser(authenticatedUser);

      if (window.navigator.cookieEnabled) {
        cookies.set("access_token", authenticatedUser.access_token);
      }

      if (registerForm.value) {
        registerForm.value = null;;
      }
      if (loginForm.value) {
        loginForm.value = null;
      }
      if (route.query.from) {
        let r: RouteLocationRaw = route.query.from as string;
        router.replace(r);
      }
    } else {
      loginFailed = true;
    }
  }
};



//});
</script>
<style>
.alerttext input {
  color: red !important;
}
</style>
