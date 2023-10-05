<template>
  <div>
    <v-tooltip top hidden>
      <template  v-slot:activator="{ props }">
        <v-btn-toggle
          v-model="active"
          background-color="transparent"
          active-class="iconActive"
        >
          <v-btn
            color="yellow"
            icon
            v-on:click="toggleEditMode"
            x-small
            ><v-icon v-bind:name="iconMDIName">iconMDIName</v-icon></v-btn
          >
        </v-btn-toggle>
      </template>
      <span>tooltip</span>
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">

import { watch, ref, PropType } from "vue"
import { EditMode } from "../../../math-common/src/unions";
import { useNotationStore } from "../store/pinia/notationStore";
import { computed } from "vue";

const notationStore = useNotationStore();

const props = defineProps({
  iconName: { type: String },
  editMode: { type: Object as PropType<EditMode> },
});


const iconMDIName = computed(() => "mdi-" + props.iconName);
const currentEditMode = computed(() => notationStore.getEditMode().value);
let active = ref(0);


function toggleEditMode() {
  if (notationStore.getEditMode().value === props.editMode) {
    notationStore.getEditMode().value = 'SYMBOL';
    //        active = 1;
  } else {
    notationStore.getEditMode().value = props.editMode!;
    active.value = 0;
  }
};


watch(() => currentEditMode, (newVal) => {
  if (newVal.value != props.editMode) {
    active.value = 1;
  }});

</script>
