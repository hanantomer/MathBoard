<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      max-width="400px"
      persistent
      @keydown.esc="closeDialog"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Lesson Access Link</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="link"
                  label="Access Link"
                  readonly
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="closeDialog"> Close </v-btn>
          <v-btn color="blue darken-1" @click="copy"> Copy To Clipboard </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useLessonStore } from "../store/pinia/lessonStore";
import useWatchHelper from "../helpers/watchHelper";

const watchHelper = useWatchHelper();
const lessonStore = useLessonStore();
const emit = defineEmits(["close"]);

const dialog = ref(false);

const props = defineProps({
  show: { type: Boolean },
});

watchHelper.watchLoadedEvent

watch(
  () => props.show,
  (newVal) => {
    dialog.value = newVal;
  },
);

const link = computed(() => {
  return `${window.location.origin}/lesson/${lessonStore.getCurrentLesson()
    ?.uuid}`;
});

function copy() {
  navigator.clipboard.writeText(link.value);
  closeDialog();
}

function closeDialog() {
  emit("close");
}
</script>
