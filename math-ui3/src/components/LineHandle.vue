<!-- TODO: create component for line handles -->
<template>
  <v-card
    class="lineHandle"
    v-on:mouseup="() => editModeStore.setDefaultEditMode()"
    v-on:mousedown="() => editModeStore.setEditMode(props.editMode)"
  ></v-card>
</template>
<script setup lang="ts">
import { PropType } from "vue";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { EditMode } from "../../../math-common/src/unions";
const editModeStore = useEditModeStore();

const props = defineProps({
  editMode: {
    required: true,
    type: Object as PropType<EditMode>,
  },
});
</script>
