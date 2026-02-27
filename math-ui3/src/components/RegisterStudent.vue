<template>
  <v-dialog v-model="show" width="700" height="500" persistent>
    <v-card style="overflow-y: hidden">
      <v-card-title>
        {{ registrationTitle }}
      </v-card-title>
      <v-card-text>
        <v-btn
          style="position: absolute; right: 10px; top: 10px"
          density="compact"
          icon="mdi-window-close"
          @click="close"
        ></v-btn>

        <v-form ref="registerForm" v-model="valid" lazy-validation>
          <v-row>
            <v-col cols="3">
              <v-text-field
                data-cy="register_fname"
                v-model="firstName"
                :rules="[rules.required]"
                label="First Name"
                maxlength="20"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-text-field
                data-cy="register_lname"
                v-model="lastName"
                :rules="[rules.required]"
                label="Last Name"
                maxlength="20"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                data-cy="register_email"
                v-model="email"
                :rules="emailRules"
                label="E-mail"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-text-field
                data-cy="register_password"
                v-model="password"
                :rules="[rules.required, rules.min]"
                :type="show1 ? 'text' : 'password'"
                label="Password"
                hint="At least 8 characters"
                counter
                @click:append="show1 = !show1"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                data-cy="register_verify"
                block
                v-model="verify"
                :rules="[rules.required, passwordMatch]"
                :type="'password'"
                label="Confirm Password"
                counter
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col class="d-flex" cols="12" align-end>
              <v-btn
                data-cy="register_signup"
                color="indigo-darken-3"
                variant="flat"
                @click="register"
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
import useAuthHelper from "../helpers/authenticationHelper";
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { UserType } from "common/unions";
const route = useRoute();

const authHelper = useAuthHelper();
let registerForm = ref(null);
let show = ref(false);
let valid = ref<boolean>(false);
let firstName = ref("");
let lastName = ref("");
let email = ref("");
let password = ref("");
let verify = ref("");
const emailRules = [
  (v: string) => !!v || "Required",
  (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid",
];
let show1 = ref(false);
let rules = {
  required: (value: string) => !!value || "Required.",
  min: (v: string) => (v && v.length >= 8) || "Min 8 characters",
};

const passwordMatch = computed(() => {
  return () => password.value === verify.value || "Password must match";
});

const emit = defineEmits(["registered"]);

let userType = ref<UserType>("STUDENT");

let redirectAfterLogin: string = "";

let registrationTitle = computed(() => "Student Registration");

watch(
  route,
  (params) => {
    show.value = false;
    if (params.name === "registerStudent") {
      redirectAfterLogin = params.query?.from?.toString() || "";
      show.value = true;
    }
  },
  { flush: "pre", immediate: true },
);

function close() {
  show.value = false;
  registerForm.value = null;
  firstName.value = "";
  lastName.value = "";
  email.value = "";
  password.value = "";
  verify.value = "";
}

async function register() {
  let formVlidated: any = await (registerForm.value as any).validate();
  if (formVlidated.valid) {

    const newUser = await
      authHelper.registerUser(
        firstName.value,
        lastName.value,
        email.value,
        password.value,
        userType.value as UserType,
      );

    if (!newUser) {
      alert("Registration failed: Email already in use.");
      return;
    } 

    registerForm.value = null;
    show.value = false;
    emit("registered", redirectAfterLogin);
  }
}
</script>
<style>
.alerttext input {
  color: red !important;
}
</style>
