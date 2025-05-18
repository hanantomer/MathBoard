<template>
  <accessLinkDialog
    :show="showAccessLinkDialog"
    @close="closeAccessLinkDialog"
  ></accessLinkDialog>

  <v-toolbar color="primary" dark class="vertical-toolbar" height="600">
    <v-tooltip
      text="Invite students via access link"
      v-if="userStore.isTeacher()"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          @click.stop="openAccessLinkDialog"
          color="white"
          x-small
          fab
          dark
          ><v-icon>mdi-account-plus</v-icon></v-btn
        >
      </template>
    </v-tooltip>

    <v-tooltip v-for="item in modeButtons" :key="item.name">
      {{ item.tooltip }}
      <template v-slot:activator="{ props }">
        <v-btn
          :data-cy="item.name"
          v-bind="props"
          icon
          x-small
          fab
          dark
          :color="item.activeState.value === 1 ? 'white' : 'green'"
          v-on:click="startEditMode(item)"
          :disabled="!editEnabled"
        >
          <v-icon
            v-if="item.icon_class"
            :style="{ transform: 'rotate(' + item.rotate + 'deg)' }"
            ><span :class="item.icon_class">{{ item.icon }}</span></v-icon
          >
          <v-icon
            v-if="item.overlay_icon"
            :icon="item.overlay_icon"
            style="position: absolute; left: 12px; top: 12px"
          >
          </v-icon>

          <v-icon
            v-if="!item.icon_class"
            :style="{ transform: 'rotate(' + item.rotate + 'deg)' }"
            :icon="item.icon"
          >
          </v-icon>
        </v-btn>
      </template>
    </v-tooltip>
    <v-tooltip
      v-for="item in answerChekButtons"
      :key="item.name"
      v-if="answerCheckMode"
    >
      {{ item.tooltip }}
      <template v-slot:activator="{ props }">
        <v-btn
          :data-cy="item.name"
          v-bind="props"
          icon
          x-small
          fab
          dark
          :color="item.activeState.value === 1 ? 'white' : 'green'"
          v-on:click="startEditMode(item)"
          :disabled="!editEnabled"
        >
          <v-icon
            v-if="item.icon_class"
            :style="{ transform: 'rotate(' + item.rotate + 'deg)' }"
            ><span :class="item.icon_class">{{ item.icon }}</span></v-icon
          >
          <v-icon
            v-if="item.overlay_icon"
            :icon="item.overlay_icon"
            style="position: absolute; left: 12px; top: 12px"
          >
          </v-icon>

          <v-icon
            v-if="!item.icon_class"
            :style="{ transform: 'rotate(' + item.rotate + 'deg)' }"
            :icon="item.icon"
          >
          </v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <ColororizeTool></ColororizeTool>
  </v-toolbar>
</template>

<script setup lang="ts">
import { watch, ref } from "vue";
import accessLinkDialog from "./AccessLinkDialog.vue";

import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { computed } from "vue";
import { useUserStore } from "../store/pinia/userStore";
import useAuthorizationHelper from "../helpers/authorizationHelper";
import { EditMode } from "common/unions";
import ColororizeTool from "./ColorizeTool.vue";

const authorizationHelper = useAuthorizationHelper();
const notationStore = useNotationStore();
const userStore = useUserStore();
const editModeStore = useEditModeStore();
let showAccessLinkDialog = ref(false);

const answerCheckMode = ref(false);

watch(
  () => notationStore.getParent().type,
  (type) => {
    answerCheckMode.value = type == "ANSWER" && userStore.isTeacher();
  },
  { immediate: true, deep: true },
);

const modeButtons: Array<{
  name: string;
  show_condition: any;
  editMode: EditMode;
  activeState: any;
  tooltip: string;
  icon_class: string; // using span with class when we dont have adequate icon
  icon: string;
  overlay_icon: string;
  rotate: number;
}> = Array(
  {
    name: "horizontalLine",
    show_condition: true,
    editMode: "HORIZONTAL_LINE_STARTED",
    activeState: ref(1),
    tooltip: "Horizontal Line",
    icon_class: "material-symbols-outlined",
    icon: "horizontal_rule",
    overlay_icon: "",
    rotate: 0,
  },
  {
    name: "verticalLine",
    show_condition: true,
    editMode: "VERTICAL_LINE_STARTED",
    activeState: ref(1),
    tooltip: "Vertical Line",
    icon_class: "material-symbols-outlined",
    icon: "horizontal_rule",
    overlay_icon: "",
    rotate: 90,
  },
  {
    name: "slopeLine",
    show_condition: true,
    editMode: "SLOPE_LINE_STARTED",
    activeState: ref(1),
    tooltip: "Slope Line",
    icon_class: "material-symbols-outlined",
    icon: "horizontal_rule",
    overlay_icon: "",
    rotate: 120,
  },
  {
    name: "curve",
    show_condition: true,
    editMode: "CURVE_STARTED",
    activeState: ref(1),
    tooltip: "curve",
    icon_class: "material-symbols-outlined",
    icon: "line_curve",
    overlay_icon: "",
    rotate: 260,
  },
  {
    name: "circle",
    show_condition: true,
    editMode: "CIRCLE_STARTED",
    activeState: ref(1),
    tooltip: "circle",
    icon_class: "material-symbols-outlined",
    icon: "circle",
    overlay_icon: "",
    rotate: 0,
  },
  {
    name: "sqrt",
    show_condition: true,
    editMode: "SQRT_STARTED",
    activeState: ref(1),
    tooltip: "Sqrt",
    icon_class: "",
    icon: "mdi-square-root",
    overlay_icon: "",
    rotate: 0,
  },
  {
    name: "exponent",
    show_condition: true,
    editMode: "EXPONENT_STARTED",
    activeState: ref(1),
    tooltip: "exponent",
    icon_class: "",
    icon: "mdi-exponent",
    overlay_icon: "",
    rotate: 0,
  },
  {
    name: "free text",
    show_condition: true,
    editMode: "TEXT_STARTED",
    activeState: ref(1),
    tooltip: "free text",
    icon_class: "",
    icon: "mdi-text",
    overlay_icon: "",
    rotate: 0,
  },
  {
    name: "annotation",
    show_condition: true,
    editMode: "ANNOTATION_STARTED",
    activeState: ref(1),
    tooltip: "annotation",
    icon_class: "",
    icon: "mdi-text-short",
    overlay_icon: "",
    rotate: 0,
  },
);

const answerChekButtons: Array<{
  name: string;
  editMode: EditMode;
  activeState: any;
  tooltip: string;
  icon_class: string; // using span with class when we dont have adequate icon
  icon: string;
  overlay_icon: string;
  rotate: number;
}> = Array(
  {
    name: "checkmark",
    show_condition: answerCheckMode.value,
    editMode: "CHECKMARK_STARTED",
    activeState: ref(1),
    tooltip: "correct",
    icon_class: "",
    icon: "mdi-checkbox-marked-circle-outline",
    overlay_icon: "",
    rotate: 0,
  },
  {
    name: "xmark",
    show_condition: answerCheckMode.value,
    editMode: "XMARK_STARTED",
    activeState: ref(1),
    tooltip: "incorrect",
    icon_class: "",
    icon: "mdi-close-outline",
    overlay_icon: "",
    rotate: 0,
  },
  {
    name: "semicheckmark",
    show_condition: answerCheckMode.value,
    editMode: "SEMICHECKMARK_STARTED",
    activeState: ref(1),
    tooltip: "partially correct",
    icon_class: "",
    icon: "mdi-checkbox-marked-circle-outline",
    overlay_icon: "mdi-window-close",
    rotate: 0,
  },
);

watch(
  () => editModeStore.getEditMode(),
  (editMode) => {
    if (
      editMode === editModeStore.getDefaultEditMode() ||
      editMode == "CELL_SELECTED" ||
      editMode == "AREA_SELECTED"
    ) {
      resetButtonsState();
    }

    const matchedButton = modeButtons.find((b) => b.editMode === editMode);
    if (matchedButton) matchedButton.activeState.value = 0;
  },
  { immediate: true, deep: true },
);

function openAccessLinkDialog() {
  showAccessLinkDialog.value = true;
}

function closeAccessLinkDialog() {
  showAccessLinkDialog.value = false;
}

const editEnabled = computed(() => {
  return authorizationHelper.canEdit();
});

function startEditMode(item: any) {
  resetButtonsState();
  notationStore.resetSelectedNotations();
  editModeStore.setEditMode(item.editMode); // watcher sets activeState to 0
}

function resetButtonsState() {
  modeButtons.forEach((b) => {
    b.activeState.value = 1;
  });
}
</script>

<style>
.vertical-toolbar {
  flex-basis: content;
  flex-flow: column wrap !important;
  width: 70px !important;
  height: max-content !important;
  padding: 4px !important;
  margin-top: 30px;
}

.vertical-toolbar .v-toolbar__content {
  flex-flow: column wrap !important;
  width: 45px !important;
  height: max-content !important;
  padding: 2px !important;
}
.vertical-toolbar-column {
  flex-basis: content;
}
</style>
