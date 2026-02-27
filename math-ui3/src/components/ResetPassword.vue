<template>
  <v-container style="width: 700px;">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="pa-4">
          <v-card-title class="text-h5 mb-4">Reset Password</v-card-title>

          <v-form ref="resetForm" v-model="valid" lazy-validation>
            <v-text-field
              v-if="!token"
              v-model="email"
              :rules="[rules.required, rules.validMail]"
              label="Email"
              required
              data-cy="reset_email"
            ></v-text-field>

            <v-text-field
              v-if="token"
              v-model="newPassword"
              :rules="[rules.required, rules.min]"
              :type="'password'"
              label="New Password"
              hint="At least 8 characters"
              required
              data-cy="new_password"
            ></v-text-field>

            <v-btn
              color="primary"
              class="mt-4"
              block
              @click="handleReset"
              data-cy="reset_submit"
            >
              {{ token ? "Set New Password" : "Send Reset Link" }}
            </v-btn>
          </v-form>

          <v-alert
            v-if="message"
            :type="error ? 'error' : 'success'"
            class="mt-4"
          >
            {{ message }}
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import useAuthHelper from "../helpers/authenticationHelper";

const route = useRoute();
const authHelper = useAuthHelper();

const valid = ref(false);
const email = ref("");
const newPassword = ref("");
const message = ref("");
const error = ref(false);
const token = ref(route.query.token as string);

const rules = {
  required: (v: string) => !!v || "Required",
  min: (v: string) => (v && v.length >= 8) || "Min 8 characters",
  validMail: (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid",
};

async function handleReset() {
  try {
    if (token.value) {
      await authHelper.resetPassword(token.value, newPassword.value);
      message.value = "Password successfully reset";
      error.value = false;
    } else {
      await authHelper.sendPasswordResetEmail(email.value);
      message.value = "Reset link sent to your email";
      error.value = false;
    }
  } catch (err) {
    message.value = (err as Error).message;
    error.value = true;
  }
}
</script>
