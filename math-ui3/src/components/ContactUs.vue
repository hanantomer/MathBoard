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
                label="Message"
                maxlength="250"
                required
              ></v-textarea>
              <v-btn @click="submit">submit</v-btn>
              <v-btn @click="close">close</v-btn>
            </form>
          </v-card-text>
        </v-card>
      </v-form>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
import { ref } from "vue";
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

const emailRules = [
  (v: string) => !!v || "Required",
  (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid",
];

async function submit() {
  let formVlidated: any = await (contactForm.value as any).validate();
  if (formVlidated) {
    contactUs.contactUs(name.value, email.value, message.value);
    emit("update:modelValue", false);
    router.push("/");
  }
}

function close() {
  emit("update:modelValue", false);
  router.push("/");
}
</script>
