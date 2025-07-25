<template>
  <accessLinkDialog
    :show="showAccessLinkDialog"
    @close="closeAccessLinkDialog"
  ></accessLinkDialog>

  <div
    style="
      position: absolute;
      top: 20%;
      left: 20%;
      max-width: 575px;
      z-index: 1000;
    "
  >
    <v-alert
      color="#C51162"
      icon="mdi-image"
      theme="dark"
      v-model="showPasteImageHelpMessage"
      closable
      title="Paste Image Instructions"
    >
      To paste an image, first copy it to your clipboard. Then, click on the
      desired cell and press Ctrl+V.
    </v-alert>
    <v-alert
      color="#C51162"
      icon="mdi-image"
      theme="dark"
      v-model="showSelectionHelpMessage"
      closable
      title="Selection Instructions"
      >To select an area, drag the mouse over the desired region.
      Then, drag the rectangle to move the selected notations, or use Ctrl+drag to copy
      them. To delete the selected notations, press Delete or Backspace.
      Another option, is to click on a single notation to select it.
    </v-alert>
  </div>

  <v-toolbar color="primary" dark :class="toolbarClass" height="600">
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

    <v-tooltip text="Paste image" v-if="userStore.isTeacher()">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          @click.stop="openPasteImageHelpMessage"
          color="white"
          x-small
          fab
          dark
          ><v-icon>mdi-image</v-icon></v-btn
        >
      </template>
    </v-tooltip>

    <v-tooltip text="Select notations" v-if="userStore.isTeacher()">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          @click.stop="openSelectionHelpMessage"
          color="white"
          x-small
          fab
          dark
          ><v-icon>mdi-selection</v-icon></v-btn
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
          :color="
            item.editMode === editModeStore.getEditMode() ? 'green' : 'white'
          "
          v-on:click="startEditMode(item)"
          :disabled="!editEnabled"
          :aria-label="item.tooltip"
          role="button"
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
          :color="
            item.editMode === editModeStore.getEditMode() ? 'green' : 'white'
          "
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
import { EditMode } from "common/unions";
import { useToolbarNavigation } from "../helpers/ToolbarNavigationHelper";
import ColororizeTool from "./ColorizeTool.vue";
import useAuthorizationHelper from "../helpers/authorizationHelper";
import useWatchHelper from "../helpers/watchHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";

const watchHelper = useWatchHelper();
const notationMutateHelper = useNotationMutateHelper();
const authorizationHelper = useAuthorizationHelper();
const notationStore = useNotationStore();
const userStore = useUserStore();
const editModeStore = useEditModeStore();
let showAccessLinkDialog = ref(false);
const toolbarNavigation = useToolbarNavigation();
const answerCheckMode = ref(false);

const toolbarClass = computed(() => {
  return "vertical-toolbar leftToolbar";
});

watch(
  () => notationStore.getParent().type,
  (type) => {
    answerCheckMode.value = type == "ANSWER" && userStore.isTeacher();
  },
  { immediate: true, deep: true },
);

const showPasteImageHelpMessage = ref(false);
const showSelectionHelpMessage = ref(false);

const modeButtons: Array<{
  name: string;
  show_condition: any;
  editMode: EditMode;
  tooltip: string;
  icon_class: string;
  icon: string;
  overlay_icon: string;
  rotate: number;
  tabIndex: number;
  action: () => void;
}> = Array(
  {
    name: "free text",
    show_condition: true,
    editMode: "TEXT_STARTED" as EditMode,
    tooltip: "free text",
    icon_class: "",
    icon: "mdi-text",
    overlay_icon: "",
    rotate: 0,
    tabIndex: 1,
  },
  {
    name: "annotation",
    show_condition: true,
    editMode: "ANNOTATION_STARTED" as EditMode,
    tooltip: "annotation",
    icon_class: "",
    icon: "mdi-text-short",
    overlay_icon: "",
    rotate: 0,
    tabIndex: 2,
  },

  {
    name: "polygon",
    show_condition: true,
    editMode: "POLYGON_STARTED" as EditMode,
    tooltip: "Polygon",
    icon_class: "material-symbols-outlined",
    icon: "polyline",
    overlay_icon: "",
    rotate: 0,
    tabIndex: 3,
  },
  {
    name: "Line",
    show_condition: true,
    editMode: "LINE_STARTED" as EditMode,
    tooltip: "Line",
    icon_class: "material-symbols-outlined",
    icon: "horizontal_rule",
    overlay_icon: "",
    rotate: 120,
    tabIndex: 4,
  },
  {
    name: "curve",
    show_condition: true,
    editMode: "CURVE_STARTED" as EditMode,
    tooltip: "curve",
    icon_class: "material-symbols-outlined",
    icon: "line_curve",
    overlay_icon: "",
    rotate: 260,
    tabIndex: 5,
  },
  {
    name: "circle",
    show_condition: true,
    editMode: "CIRCLE_STARTED" as EditMode,
    tooltip: "circle",
    icon_class: "material-symbols-outlined",
    icon: "circle",
    overlay_icon: "",
    rotate: 0,
    tabIndex: 6,
  },
  {
    name: "sqrt",
    show_condition: true,
    editMode: "SQRT_STARTED" as EditMode,
    tooltip: "Sqrt",
    icon_class: "",
    icon: "mdi-square-root",
    overlay_icon: "",
    rotate: 0,
    tabIndex: 7,
  },
  {
    name: "exponent",
    show_condition: true,
    editMode: "EXPONENT_STARTED" as EditMode,
    tooltip: "exponent Alt+x",
    icon_class: "",
    icon: "mdi-exponent",
    overlay_icon: "",
    rotate: 0,
    tabIndex: 8,
    shortcut: "Alt+x",
  },
  {
    name: "log",
    show_condition: true,
    editMode: "LOG_STARTED" as EditMode,
    tooltip: "log Alt+l",
    icon_class: "",
    icon: "mdi-math-log",
    overlay_icon: "",
    rotate: 0,
    tabIndex: 8,
    shortcut: "Alt+l",
  },
).map((symbol) => ({
  ...symbol,
  action: () => editModeStore.setEditMode(symbol.editMode as EditMode),
}));

const answerChekButtons: Array<{
  name: string;
  editMode: EditMode;
  tooltip: string;
  icon_class: string;
  icon: string;
  overlay_icon: string;
  rotate: number;
  action: () => void;
}> = Array(
  {
    name: "checkmark",
    show_condition: answerCheckMode.value,
    editMode: "CHECKMARK_STARTED" as EditMode,
    tooltip: "correct",
    icon_class: "",
    icon: "mdi-checkbox-marked-circle-outline",
    overlay_icon: "",
    rotate: 0,
  },
  {
    name: "xmark",
    show_condition: answerCheckMode.value,
    editMode: "XMARK_STARTED" as EditMode,
    tooltip: "incorrect",
    icon_class: "",
    icon: "mdi-close-outline",
    overlay_icon: "",
    rotate: 0,
  },
  {
    name: "semicheckmark",
    show_condition: answerCheckMode.value,
    editMode: "SEMICHECKMARK_STARTED" as EditMode,
    tooltip: "partially correct",
    icon_class: "",
    icon: "mdi-checkbox-marked-circle-outline",
    overlay_icon: "mdi-window-close",
    rotate: 0,
  },
).map((symbol) => ({
  ...symbol,
  action: () => editModeStore.setEditMode(symbol.editMode as EditMode),
}));

watchHelper.watchKeyEvent(["CELL_SELECTED"], "EV_KEYUP", (e: KeyboardEvent) =>
  toolbarNavigation.handleKeyboardNavigation(e, toolbarClass.value),
);

watchHelper.watchKeyEvent(["CELL_SELECTED"], "EV_KEYUP", (e: KeyboardEvent) =>
  toolbarNavigation.handleShortcuts(e, modeButtons),
);

watchHelper.watchEditModeTransition(["CELL_SELECTED"], "LOG_STARTED", () =>
  notationMutateHelper.addSymbolNotation("log"),
);

function openAccessLinkDialog() {
  showAccessLinkDialog.value = true;
}

function openPasteImageHelpMessage() {
  showPasteImageHelpMessage.value = true;
}

function openSelectionHelpMessage() {
  showSelectionHelpMessage.value = true;
}

function closeAccessLinkDialog() {
  showAccessLinkDialog.value = false;
}

const editEnabled = computed(() => {
  return authorizationHelper.canEdit();
});

function startEditMode(item: any) {
  notationStore.resetSelectedNotations();
  editModeStore.setEditMode(item.editMode); // watcher sets activeState to 0
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
