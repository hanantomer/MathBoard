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
                :rules="[rules.required, passwordMatchRule]"
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
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { UserType } from "common/unions";
import useRegistration from "../composables/registration";

const route = useRoute();
const router = useRouter();

const {
  registerForm,
  valid,
  firstName,
  lastName,
  email,
  password,
  verify,
  show1,
  emailRules,
  rules,
  passwordMatchRule,
  registrationTitle,
  resetForm,
  register: performRegister,
} = useRegistration("STUDENT");

let show = ref(false);

const emit = defineEmits(["registered"]);

let redirectAfterLogin: string = "";

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
  resetForm();
  router.push("/");
}

async function register() {
  const success = await performRegister();
  if (success) {
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
