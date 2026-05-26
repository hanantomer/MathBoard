<template>
  <v-footer v-if="!isMobile()" color="primary" padless dense app width="100%">
    <v-row justify="center" no-gutters>
      <v-col cols="12" sm="auto" class="text-center">
        <p style="color: whitesmoke; margin-right: 10px">
          © Copyright 2026 www.themathboard.com
        </p>
      </v-col>
      <v-col cols="12" sm="auto" class="text-center">
        <v-btn
          style="background-color: transparent; color: whitesmoke"
          class="ml-1"
          height="25"
          flat
          href="/privacyPolicy.html"
          target="_blank"
        >
          Privacy Policy
        </v-btn>

        <v-btn
          style="background-color: transparent; color: whitesmoke"
          class="ml-1"
          height="25"
          flat
          @click="emit('show-contact-us')"
        >
          Contact Us
        </v-btn>
      </v-col>
    </v-row>
  </v-footer>
</template>

<script setup lang="ts">
import { isMobile } from "common/globals";

const emit = defineEmits<{
  "show-contact-us": [];
}>();
</script>
