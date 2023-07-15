<template>
  <v-row justify="center">
    <v-dialog v-model="show" max-width="400px" @keydown.esc="show = false">
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
                  value=""
                  readonly
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="show = false">
            Close
          </v-btn>
          <v-btn color="blue darken-1" text @click="copy">
            Copy To Clipboard
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>i
</template>

<script setup lang="ts">

import { computed, ref, watch } from "vue"
import { apiHost } from "../../../math-common/src/globals";
import { useLessonStore } from "../store/pinia/lessonStore";

const lessonStore = useLessonStore();

const props = defineProps({
  dialog: Boolean
});

watch(()=> props.dialog, (show: boolean) => {
  show = show;
})

let show = ref(false);

//let show = computed({
//    get() : boolean {
//      return props.value;
 // }
  //,
   // set(value: boolean) {
   //   emit("input", value);
   // },
//});

const link = computed(() => {
  return apiHost + "/lesson/" + lessonStore.currentLesson.uuid;
});

function copy() {
    navigator.clipboard.writeText(link.value);
    show.value = false;
};

</script>
