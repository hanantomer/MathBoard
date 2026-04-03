<template>
  <v-row justify="center">
    <v-dialog
      :model-value="modelValue"
      @update:model-value="(val) => emit('update:modelValue', val)"
      max-width="400px"
      persistent
      @keydown.esc="close"
    >
      <v-form ref="contactForm">
        <v-card>
          <v-card-title>
            <span class="headline">{{ title || "Contact Us" }}</span>
          </v-card-title>
          <v-card-text>
            <form>
              <v-text-field
                v-model="name"
                :rules="nameRules"
                label="Name"
                required
                maxlength="25"
                autocomplete="name"
              ></v-text-field>
              <v-text-field
                v-model="email"
                :rules="emailRules"
                label="E-mail"
                maxlength="50"
                required
                autocomplete="email"
              ></v-text-field>
              <v-textarea
                v-model="message"
                :rules="messageRules"
                label="Message"
                maxlength="250"
                required
              ></v-textarea>
              <v-btn :disabled="isSubmitDisabled" type="button" @click="submit"
                >Submit</v-btn
              >
              <v-btn type="button" @click="close">Close</v-btn>
            </form>
          </v-card-text>
        </v-card>
      </v-form>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import useContactUs from "../helpers/contactUsHelper";
import { useRouter } from "vue-router";

const props = defineProps<{
  modelValue: boolean;
  title?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const router = useRouter();

const contactUs = useContactUs();

let contactForm = ref(null);
let name = ref("");
let email = ref("");
let message = ref("");

const nameRules = [(v: string) => !!v || "Required"];
const emailRules = [
  (v: string) => !!v || "Required",
  (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid",
];
const messageRules = [(v: string) => !!v || "Required"];

const isSubmitDisabled = computed(() => {
  const emailValid = /.+@.+\..+/.test(email.value);
  return !name.value || !email.value || !message.value || !emailValid;
});

async function submit() {
  const formValidated: any = await (contactForm.value as any)?.validate();
  if (!formValidated) {
    return;
  }

  // additional safety guard
  if (isSubmitDisabled.value) {
    return;
  }

  contactUs.contactUs(name.value, email.value, message.value);
  emit("update:modelValue", false);
  router.push("/");
}

function close() {
  emit("update:modelValue", false);
  router.push("/");
}
</script>
