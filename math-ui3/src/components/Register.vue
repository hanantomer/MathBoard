<template>
  <v-dialog v-model="show" persistent width="600" height="600">
    <v-card height="550">
      <v-card-title background-color="primary">
        <span class="text-h5">Sign Up To Mathboard</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="registerForm" v-model="valid" lazy-validation>
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
                label="Confirm Password"
                counter
                @click:append="show1 = !show1"
              ></v-text-field>
            </v-col>
            <v-spacer></v-spacer>
            <v-col class="d-flex ml-auto" cols="12" sm="3" xsm="12">
              <v-btn x-large block @click="register">Sign Up</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { UesrType } from "../../../math-common/src/enum";
import useAuthHelper from "../helpers/authHelper";
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";

const authHelper = useAuthHelper();
const router = useRouter();

let registerForm = ref(null);

let show = false;
let valid = ref(false);
let firstName = ref("hanan");
let lastName = ref("tomer");
let email = ref("hanantomer@gmail.com");
let password = ref("12345678");
let verify = ref("12345678");
const emailRules = [
  (v: string) => !!v || "Required",
  (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid",
];
let show1 = false;
let rules = {
  required: (value: string) => !!value || "Required.",
  min: (v: string) => (v && v.length >= 8) || "Min 8 characters",
};

const passwordMatch = computed(() => {
  return () => password.value === verify.value || "Password must match";
});

const props = defineProps({
  dialog: {
    type: Boolean,
    default: false,
  },
});

watch(() => props.dialog, (val) => {
  show = val
});

async function register() {
  let formVlidated: any = await (registerForm.value as any).validate();
  if (formVlidated.valid) {
    authHelper.registerUser(
      firstName.value,
      lastName.value,
      email.value,
      password.value,
      UesrType.STUDENT
    );

    registerForm.value = null;
    show = false;
    router.push("/login");
  }
}
</script>
<style>
.alerttext input {
  color: red !important;
}
</style>
