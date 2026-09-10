<template>
  <accessLinkDialog
    :show="showAccessLinkDialog"
    @close="closeAccessLinkDialog"
    @open-students="openOnlineStudentsFromAccessLink"
    @highlight-students="highlightOnlineStudentsFromAccessLink"
  ></accessLinkDialog>

  <CrossDeviceUpload
    :show="showUploadDialog"
    @close="closeUploadDialog"
  ></CrossDeviceUpload>

  <aside class="vertical-toolbar">
    <span v-if="userStore.isTeacher()" class="toolbar-section-label">{{
      TOOLBAR_SECTIONS.import
    }}</span>
    <v-tooltip
      text="Upload from phone. To paste from clipboard, select a cell and press Ctrl+V."
      v-if="userStore.isTeacher()"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          @click.stop="doShowUploadDialog"
          x-small
          fab
          dark
          ><v-icon color="white">mdi-camera-plus-outline</v-icon></v-btn
        >
      </template>
    </v-tooltip>

    <span v-if="userStore.isTeacher()" class="toolbar-section-label">{{
      TOOLBAR_SECTIONS.select
    }}</span>
    <v-tooltip v-if="userStore.isTeacher()" :text="selectionHelpText">
      <template v-slot:activator="{ props }">
        <v-btn
          data-cy="selectionButton"
          v-bind="props"
          icon
          @click.stop="startSelection"
          x-small
          fab
          dark
          color="white"
          class="toolbar-mode-btn"
          :class="{ 'toolbar-mode-btn--active': isAreaSelectionActive }"
          ><v-icon color="white">mdi-selection</v-icon></v-btn
        >
      </template>
    </v-tooltip>

    <span class="toolbar-section-label">{{ TOOLBAR_SECTIONS.draw }}</span>
    <v-tooltip v-for="item in drawModeButtons" :key="item.name">
      {{ getModeTooltip(item) }}
      <template v-slot:activator="{ props: tooltipProps }">
        <span v-bind="tooltipProps" class="toolbar-btn-wrap">
          <v-btn
            :data-cy="item.name.toLowerCase() + 'Button'"
            icon
            x-small
            fab
            dark
            color="white"
            :class="getModeButtonClass(item)"
            v-on:click="startEditMode(item)"
            :disabled="!editEnabled"
            :aria-label="getModeTooltip(item)"
            :aria-disabled="!editEnabled"
            role="button"
            class="toolbar-mode-btn"
          >
          <svg
            v-if="item.icon === 'cartesian-axes'"
            class="toolbar-cartesian-icon"
            viewBox="0 0 24 24"
            width="22"
            height="22"
            aria-hidden="true"
            focusable="false"
          >
            <line
              x1="3"
              y1="12"
              x2="17.2"
              y2="12"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
            <polygon points="21,12 16,9.1 16,14.9" fill="currentColor" />
            <line
              x1="12"
              y1="21"
              x2="12"
              y2="6.8"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
            <polygon points="12,3 9.1,8 14.9,8" fill="currentColor" />
          </svg>
          <v-icon
            color="white"
            v-if="item.icon_class"
            :style="{ transform: 'rotate(' + item.rotate + 'deg)' }"
            ><span :class="item.icon_class">{{ item.icon }}</span></v-icon
          >
          <v-icon
            color="white"
            v-if="item.overlay_icon"
            :icon="item.overlay_icon"
            style="position: absolute; left: 12px; top: 12px"
          >
          </v-icon>

          <v-icon
            color="white"
            v-if="!item.icon_class && item.icon !== 'cartesian-axes'"
            :style="{ transform: 'rotate(' + item.rotate + 'deg)' }"
            :icon="item.icon"
          >
          </v-icon>
          </v-btn>
        </span>
      </template>
    </v-tooltip>

    <span class="toolbar-section-label">{{ TOOLBAR_SECTIONS.text }}</span>
    <v-tooltip v-for="item in textModeButtons" :key="item.name">
      {{ getModeTooltip(item) }}
      <template v-slot:activator="{ props: tooltipProps }">
        <span v-bind="tooltipProps" class="toolbar-btn-wrap">
          <v-btn
            :data-cy="item.name.toLowerCase() + 'Button'"
            icon
            x-small
            fab
            dark
            color="white"
            :class="getModeButtonClass(item)"
            v-on:click="startEditMode(item)"
            :disabled="!editEnabled"
            :aria-label="getModeTooltip(item)"
            :aria-disabled="!editEnabled"
            role="button"
            class="toolbar-mode-btn"
          >
          <v-icon
            color="white"
            v-if="item.icon_class"
            :style="{ transform: 'rotate(' + item.rotate + 'deg)' }"
            ><span :class="item.icon_class">{{ item.icon }}</span></v-icon
          >
          <v-icon
            color="white"
            v-if="item.overlay_icon"
            :icon="item.overlay_icon"
            style="position: absolute; left: 12px; top: 12px"
          >
          </v-icon>

          <v-icon
            color="white"
            v-if="!item.icon_class"
            :style="{ transform: 'rotate(' + item.rotate + 'deg)' }"
            :icon="item.icon"
          >
          </v-icon>
          </v-btn>
        </span>
      </template>
    </v-tooltip>

    <span v-if="answerCheckMode" class="toolbar-section-label">{{
      TOOLBAR_SECTIONS.marks
    }}</span>
    <v-tooltip
      v-for="item in answerChekButtons"
      :key="item.name"
      v-if="answerCheckMode"
    >
      {{ getModeTooltip(item) }}
      <template v-slot:activator="{ props: tooltipProps }">
        <span v-bind="tooltipProps" class="toolbar-btn-wrap">
          <v-btn
            :data-cy="item.name"
            icon
            x-small
            fab
            dark
            color="white"
            :class="getAnswerCheckButtonClass(item)"
            v-on:click="startEditMode(item)"
            :disabled="!editEnabled"
            :aria-label="getModeTooltip(item)"
            :aria-disabled="!editEnabled"
            class="toolbar-mode-btn"
          >
          <v-icon
            v-if="item.icon_class"
            color="white"
            :style="{ transform: 'rotate(' + item.rotate + 'deg)' }"
            ><span :class="item.icon_class">{{ item.icon }}</span></v-icon
          >
          <v-icon
            v-if="item.overlay_icon"
            color="white"
            :icon="item.overlay_icon"
            style="position: absolute; left: 12px; top: 12px"
          >
          </v-icon>

          <v-icon
            v-if="!item.icon_class"
            color="white"
            :style="{ transform: 'rotate(' + item.rotate + 'deg)' }"
            :icon="item.icon"
          >
          </v-icon>
          </v-btn>
        </span>
      </template>
    </v-tooltip>
  </aside>
</template>

<script setup lang="ts">
import { watch, ref, computed } from "vue";
import accessLinkDialog from "./AccessLinkDialog.vue";

import { useNotationStore } from "../store/pinia/notationStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useUserStore } from "../store/pinia/userStore";
import { EditMode, GlobalEditMode } from "common/unions";
import { useToolbarNavigation } from "../helpers/ToolbarNavigationHelper";
import useAuthorizationHelper from "../helpers/authorizationHelper";
import useWatchHelper from "../helpers/watchHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import CrossDeviceUpload from "./CrossDeviceUpload.vue";
import { useUiHintStore } from "../store/pinia/uiHintStore";
import { useOnboardingStore } from "../store/pinia/onboardingStore";
import {
  DRAW_TOOL_NAMES,
  TEXT_TOOL_NAMES,
  TOOLBAR_SECTIONS,
  getSelectionHelpText,
  getToolTooltip,
} from "../constants/helpCopy";

const watchHelper = useWatchHelper();
const notationMutateHelper = useNotationMutateHelper();
const authorizationHelper = useAuthorizationHelper();
const notationStore = useNotationStore();
const userStore = useUserStore();
const editModeStore = useEditModeStore();
const uiHintStore = useUiHintStore();
const onboardingStore = useOnboardingStore();
let showAccessLinkDialog = ref(false);
const toolbarNavigation = useToolbarNavigation();
const answerCheckMode = ref(false);

watch(
  () => notationStore.getParent()?.type,
  (type) => {
    answerCheckMode.value = type == "ANSWER" && userStore.isTeacher();
  },
  { immediate: true, deep: true },
);

const selectionHelpText = computed(() => getSelectionHelpText());

watch(
  () => uiHintStore.accessLinkDialogRequest,
  () => {
    showAccessLinkDialog.value = true;
  },
);

const showUploadDialog = ref(false);

const modeButtons: Array<{
  name: string;
  show_condition: any;
  editMode: EditMode;
  globalEditMode: GlobalEditMode;
  tooltip: string;
  icon_class: string;
  icon: string;
  overlay_icon: string;
  rotate: number;
  tabIndex: number;
  action: () => void;
}> = Array(
  {
    name: "FreeText",
    show_condition: true,
    editMode: "TEXT_STARTED" as EditMode,
    globalEditMode: "TEXT" as GlobalEditMode,
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
    globalEditMode: "ANNOTATION" as GlobalEditMode,
    tooltip: "toggle annotation mode",
    icon_class: "",
    icon: "mdi-text-short",
    overlay_icon: "",
    rotate: 0,
    tabIndex: 2,
  },
  {
    name: "freeSketch",
    show_condition: true,
    editMode: "FREE_SKETCH_STARTED" as EditMode,
    globalEditMode: "FREE_SKETCH" as GlobalEditMode,
    tooltip: "toggle free sketch mode",
    icon_class: "",
    icon: "mdi-pencil",
    overlay_icon: "",
    rotate: 0,
    tabIndex: 3,
  },
  {
    name: "freeSketchOcr",
    show_condition: true,
    editMode: "FREE_SKETCH_WITH_OCR_STARTED" as EditMode,
    globalEditMode: "FREE_SKETCH_WITH_OCR" as GlobalEditMode,
    tooltip: "Sketch → symbol (OCR)",
    icon_class: "",
    icon: "mdi-draw",
    overlay_icon: "",
    rotate: 0,
    tabIndex: 3,
  },
  {
    name: "Line",
    show_condition: true,
    editMode: "LINE_STARTED" as EditMode,
    globalEditMode: "LINE" as GlobalEditMode,
    tooltip: "toggle line mode",
    icon_class: "material-symbols-outlined",
    icon: "horizontal_rule",
    overlay_icon: "",
    rotate: 120,
    tabIndex: 3,
  },
  {
    name: "polyline",
    show_condition: true,
    editMode: "POLYGON_STARTED" as EditMode,
    globalEditMode: "TEXT" as GlobalEditMode,
    tooltip: "Polyline",
    icon_class: "material-symbols-outlined",
    icon: "polyline",
    overlay_icon: "",
    rotate: 0,
    tabIndex: 4,
  },
  {
    name: "DivisionLine",
    show_condition: true,
    editMode: "DIVISIONLINE_STARTED" as EditMode,
    globalEditMode: "TEXT" as GlobalEditMode,
    tooltip: "Division Line",
    icon_class: "material-symbols-outlined",
    icon: "horizontal_rule",
    overlay_icon: "",
    rotate: 180,
    tabIndex: 5,
  },
  {
    name: "sqrt",
    show_condition: true,
    editMode: "SQRT_STARTED" as EditMode,
    globalEditMode: "TEXT" as GlobalEditMode,
    tooltip: "Sqrt Alt+s",
    shortcut: "Alt+s",
    icon_class: "",
    icon: "mdi-square-root",
    overlay_icon: "",
    rotate: 0,
    tabIndex: 6,
  },
  {
    name: "curve",
    show_condition: true,
    editMode: "CURVE_STARTED" as EditMode,
    globalEditMode: "TEXT" as GlobalEditMode,
    tooltip: "curve",
    icon_class: "material-symbols-outlined",
    icon: "line_curve",
    overlay_icon: "",
    rotate: 260,
    tabIndex: 7,
  },
  {
    name: "circle",
    show_condition: true,
    editMode: "CIRCLE_STARTED" as EditMode,
    globalEditMode: "TEXT" as GlobalEditMode,
    tooltip: "circle",
    icon_class: "material-symbols-outlined",
    icon: "circle",
    overlay_icon: "",
    rotate: 0,
    tabIndex: 8,
  },
  {
    name: "parabola",
    show_condition: true,
    editMode: "PARABOLA_STARTED" as EditMode,
    globalEditMode: "TEXT" as GlobalEditMode,
    tooltip: "parabola",
    icon_class: "",
    icon: "mdi-chart-bell-curve-cumulative",
    overlay_icon: "",
    rotate: 0,
    tabIndex: 9,
  },
  {
    name: "hyperbola",
    show_condition: true,
    editMode: "HYPERBOLA_STARTED" as EditMode,
    globalEditMode: "TEXT" as GlobalEditMode,
    tooltip: "hyperbola",
    icon_class: "",
    icon: "mdi-chart-bell-curve",
    overlay_icon: "",
    rotate: 0,
    tabIndex: 10,
  },
  {
    name: "cartesian system",
    show_condition: true,
    editMode: "CARTESIAN_SYSTEM_STARTED" as EditMode,
    globalEditMode: "TEXT" as GlobalEditMode,
    tooltip: "cartesian system",
    icon_class: "",
    icon: "cartesian-axes",
    overlay_icon: "",
    rotate: 0,
    tabIndex: 11,
  },
  {
    name: "exponent",
    show_condition: true,
    editMode: "EXPONENT_STARTED" as EditMode,
    globalEditMode: "TEXT" as GlobalEditMode,
    tooltip: "exponent Alt+x",
    icon_class: "",
    icon: "mdi-exponent",
    overlay_icon: "",
    rotate: 0,
    tabIndex: 10,
    shortcut: "Alt+x",
  },
  {
    name: "log",
    show_condition: true,
    editMode: "LOG_STARTED" as EditMode,
    globalEditMode: "TEXT" as GlobalEditMode,
    tooltip: "log Alt+l",
    icon_class: "",
    icon: "mdi-math-log",
    overlay_icon: "",
    rotate: 0,
    tabIndex: 11,
    shortcut: "Alt+l",
  },
).map((symbol) => ({
  ...symbol,
  tooltip: getToolTooltip(symbol.name),
  action: () => {
    if (symbol.name === "sqrt") {
      void notationMutateHelper.placeSqrtAtSelection();
      return;
    }
    editModeStore.setEditMode(symbol.editMode as EditMode);
  },
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
  tooltip: getToolTooltip(symbol.name),
  action: () => editModeStore.setEditMode(symbol.editMode as EditMode),
}));

const drawModeButtons = computed(() =>
  modeButtons.filter((b) => DRAW_TOOL_NAMES.has(b.name)),
);
const textModeButtons = computed(() =>
  modeButtons.filter((b) => TEXT_TOOL_NAMES.has(b.name)),
);

watchHelper.watchKeyEvent(
  ["CELL_SELECTED", "AREA_SELECTED"],
  "EV_SHORTCUT_KEYUP",
  (e: KeyboardEvent) => toolbarNavigation.handleShortcuts(e, modeButtons),
);

watchHelper.watchEditModeTransition(["CELL_SELECTED"], "LOG_STARTED", () => {
  void notationMutateHelper.addSymbolNotation("log");
});

function doShowUploadDialog() {
  showUploadDialog.value = true;
}

function closeUploadDialog() {
  showUploadDialog.value = false;
}

function startSelection() {
  if (isAreaSelectionActive.value) {
    notationStore.resetSelectedNotations();
    editModeStore.setDefaultEditMode();
    return;
  }
  notationStore.resetSelectedNotations();
  editModeStore.setGlobalEditMode("TEXT");
  editModeStore.setEditMode("AREA_SELECTION_STARTED");
  onboardingStore.tryShowToolCoachMark("selection");
}

function closeAccessLinkDialog() {
  showAccessLinkDialog.value = false;
}

function openOnlineStudentsFromAccessLink() {
  showAccessLinkDialog.value = false;
  editModeStore.setEditMode("STUDENTS_MONITORING");
}

function highlightOnlineStudentsFromAccessLink() {
  showAccessLinkDialog.value = false;
  uiHintStore.flashOnlineStudentsButton();
}

const editEnabled = computed(() => {
  return authorizationHelper.canEdit();
});

const editingDisabledReason = computed(() => {
  if (editEnabled.value) {
    return "";
  }
  if (notationStore.getParent()?.type === "LESSON") {
    return "View only — your teacher must allow you to edit";
  }
  return "Editing is not available on this board";
});

function getModeTooltip(item: { tooltip: string }): string {
  if (editEnabled.value) {
    return item.tooltip;
  }
  return `${item.tooltip} (${editingDisabledReason.value})`;
}

const isAreaSelectionActive = computed(
  () => editModeStore.getEditMode() === "AREA_SELECTION_STARTED",
);

function startEditMode(item: {
  name: string;
  globalEditMode?: GlobalEditMode;
  editMode: EditMode;
}) {
  if (item.name === "sqrt") {
    editModeStore.setGlobalEditMode("TEXT");
    void notationMutateHelper.placeSqrtAtSelection();
    return;
  }
  if (isModeActive(item)) {
    notationStore.resetSelectedNotations();
    editModeStore.setDefaultEditMode();
    return;
  }
  notationStore.resetSelectedNotations();
  editModeStore.setGlobalEditMode(item.globalEditMode ?? "TEXT");
  editModeStore.setEditMode(item.editMode);
  if (item.name === "Line" || item.name === "FreeText") {
    onboardingStore.tryShowToolCoachMark(item.name);
  }
}

const STICKY_DRAW_MODES: Record<string, EditMode[]> = {
  polyline: ["POLYGON_STARTED", "POLYGON_DRAWING"],
};

function isModeActive(item: any) {
  const globalModes = ["FREE_SKETCH", "FREE_SKETCH_WITH_OCR", "LINE", "ANNOTATION"];

  if (globalModes.includes(item.globalEditMode)) {
    return editModeStore.getGlobalEditMode() === item.globalEditMode;
  }
  const stickyModes = STICKY_DRAW_MODES[item.name];
  if (stickyModes) {
    return stickyModes.includes(editModeStore.getEditMode());
  }
  return item.editMode === editModeStore.getEditMode();
}

function getModeButtonClass(item: any) {
  const globalModes = ["FREE_SKETCH", "FREE_SKETCH_WITH_OCR", "LINE", "ANNOTATION"];
  const parts: string[] = [];
  if (!editEnabled.value) {
    parts.push("toolbar-mode-btn--disabled");
  }
  if (globalModes.includes(item.globalEditMode)) {
    parts.push("global-mode-button");
    if (isModeActive(item) && editEnabled.value) {
      parts.push("active");
    }
  }
  if (isModeActive(item) && editEnabled.value) {
    parts.push("toolbar-mode-btn--active");
  }
  return parts.join(" ");
}

function getAnswerCheckButtonClass(item: { editMode: EditMode }) {
  const parts: string[] = [];
  if (!editEnabled.value) {
    parts.push("toolbar-mode-btn--disabled");
  }
  if (item.editMode === editModeStore.getEditMode() && editEnabled.value) {
    parts.push("toolbar-mode-btn--active");
  }
  return parts.join(" ");
}
</script>

<style scoped>
/*@media (max-width: 1023px) {
  .vertical-toolbar {
    position: static;
    width: 0px !important;
    height: 0px !important;
  }
}*/

.vertical-toolbar {
  --app-bar-height: 64px;
  --toolbar-gap: 8px;
  --app-footer-height: 56px;
  --toolbar-top: calc(var(--app-bar-height) + var(--toolbar-gap));
  --toolbar-bottom: var(--app-footer-height);

  position: fixed;
  top: var(--toolbar-top);
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px !important;
  max-width: 140px !important;
  height: calc(100dvh - var(--toolbar-top) - var(--toolbar-bottom)) !important;
  max-height: calc(100dvh - var(--toolbar-top) - var(--toolbar-bottom)) !important;
  padding: 4px 6px 6px !important;
  background: #202750;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 2px 0 14px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  overscroll-behavior: none;
  z-index: 1000;
}

/* Mobile styles */
@media (max-width: 1023px) {
  .vertical-toolbar {
    --toolbar-bottom: max(8px, env(safe-area-inset-bottom));
    width: 56px !important;
    max-width: 56px !important;
    padding: 4px 2px 6px !important;
    box-shadow: 4px 0 16px rgba(0, 0, 0, 0.28);
  }
}

/* Landscape mobile: keep the same left column + vertical scroll as portrait
   (do not switch to a horizontal strip). */

/* .vertical-toolbar .v-toolbar__content {
  flex-flow: column wrap !important;
  width: 58px !important;
  padding: 4px !important;
  align-items: center;
}

.vertical-toolbar-column {
  flex-basis: content;
}

.vertical-toolbar .v-btn {
  width: 44px;
  height: 44px;
} */

.toolbar-btn-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
}

.vertical-toolbar > :not(.toolbar-section-label) {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.vertical-toolbar :deep(button.v-btn) {
  background-color: transparent !important;
  width: min(40px, 100%) !important;
  height: min(40px, 100%) !important;
  min-width: 28px !important;
  min-height: 28px !important;
}

.vertical-toolbar :deep(button.v-btn.toolbar-mode-btn--disabled),
.vertical-toolbar :deep(button.v-btn:disabled) {
  opacity: 0.38 !important;
  cursor: not-allowed !important;
  box-shadow: none !important;
}

.vertical-toolbar :deep(button.v-btn.toolbar-mode-btn--disabled .v-icon),
.vertical-toolbar :deep(button.v-btn:disabled .v-icon) {
  color: rgba(255, 255, 255, 0.45) !important;
}

.toolbar-cartesian-icon {
  display: block;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  color: #fff;
}

.vertical-toolbar :deep(button.v-btn.toolbar-mode-btn--disabled .toolbar-cartesian-icon),
.vertical-toolbar :deep(button.v-btn:disabled .toolbar-cartesian-icon) {
  color: rgba(255, 255, 255, 0.45) !important;
}

.vertical-toolbar :deep(button.v-btn.toolbar-mode-btn--disabled .material-symbols-outlined),
.vertical-toolbar :deep(button.v-btn:disabled .material-symbols-outlined) {
  color: rgba(255, 255, 255, 0.45) !important;
}

.global-mode-button {
  box-shadow: 0 0 0 2px rgba(244, 243, 243, 0.25);
  border-radius: 50% !important;
}

.global-mode-button.active:not(.toolbar-mode-btn--active) {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.75);
}

/* Legacy styles for backward compatibility */
.free-sketch-button {
  box-shadow: 0 0 0 2px rgba(244, 243, 243, 0.25);
  border-radius: 50% !important;
}

.free-sketch-button.active {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.75);
}

.vertical-toolbar :deep(button.v-btn.toolbar-mode-btn--active) {
  background-color: rgba(66, 165, 245, 0.28) !important;
  box-shadow:
    0 0 0 2px #42a5f5,
    0 0 14px rgba(66, 165, 245, 0.35) !important;
  border-radius: 50% !important;
}

span.v-btn__overlay {
  background-color: transparent !important;
}

.vertical-toolbar :deep(.toolbar-mode-btn--active .v-icon) {
  color: #e3f2fd !important;
}

.vertical-toolbar :deep(.toolbar-mode-btn--active .toolbar-cartesian-icon) {
  color: #e3f2fd !important;
}

.toolbar-section-label {
  display: block;
  flex: 0 0 auto;
  width: 100%;
  margin: 6px 0 2px;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-align: center;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.2;
}

.toolbar-section-label:first-child {
  margin-top: 0;
}

</style>
