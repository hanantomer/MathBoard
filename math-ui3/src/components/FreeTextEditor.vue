<template>
  <div
    v-show="show"
    class="freeTextRoot"
    id="textAreaRoot"
    data-cy="freeTextEditorRoot"
    :style="editorStyle"
    @pointerdown.stop
  >
    <textarea
      data-cy="freeTextEditor"
      class="freeText"
      id="textAreaEl"
      v-model="textValue"
      @input="throttledSyncOutgoingChanges"
    ></textarea>
    <text-resize-handles
      v-if="authorizationHelper.canEdit()"
      @start="startEditorResize"
      @end="endEditorResize"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from "vue";
import { throttle } from "lodash";
import { useCellStore } from "../store/pinia/cellStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { useUserStore } from "../store/pinia/userStore";
import { useLessonStore } from "../store/pinia/lessonStore";
import { usePracticeStore } from "../store/pinia/practiceStore";
import { RectCoordinates, RectNotationAttributes } from "common/baseTypes";
import { EditMode } from "common/unions";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import usescreenHelper from "../helpers/screenHelper";
import useWatchHelper from "../helpers/watchHelper";
import useAuthorizationHelper from "../helpers/authorizationHelper";
import useUserOutgoingOperationsHelper from "../helpers/userOutgoingOperationsHelper";
import { isPracticeBoard } from "../helpers/practiceBoardAdapter";
import { clientPointToSvgUser } from "../helpers/pointerCoordinateHelper";
import textResizeHandles from "./TextResizeHandles.vue";
import {
  applyTextResizeHandle,
  type TextResizeHandle,
  type ViewportBox,
} from "../helpers/textResizeHelper";
const notationMutateHelper = useNotationMutateHelper();
const watchHelper = useWatchHelper();
const authorizationHelper = useAuthorizationHelper();

let textValue = ref("");
const cellStore = useCellStore();
const notationStore = useNotationStore();
const editModeStore = useEditModeStore();
const userStore = useUserStore();
const lessonStore = useLessonStore();
const practiceStore = usePracticeStore();
const screenHelper = usescreenHelper();
const userOutgoingOperations = useUserOutgoingOperationsHelper();

const show = computed(() => editModeStore.getEditMode() === "TEXT_WRITING");

const editorBox = ref<ViewportBox>({
  left: 0,
  top: 0,
  width: 160,
  height: 80,
});

const editorStyle = computed(() => ({
  left: `${editorBox.value.left}px`,
  top: `${editorBox.value.top}px`,
  width: `${editorBox.value.width}px`,
  height: `${editorBox.value.height}px`,
}));

const selectedNotation = computed(() =>
  notationStore.getSelectedNotations()?.length == 0
    ? null
    : (notationStore.getSelectedNotations().at(0) as RectNotationAttributes),
);

function syncPracticeTextDraft() {
  if (!isPracticeBoard()) return;
  practiceStore.setTextDraft(
    textValue.value,
    selectedNotation.value?.notationType === "TEXT"
      ? selectedNotation.value.uuid
      : null,
  );
}

watch(textValue, syncPracticeTextDraft);

watch(show, (isWriting) => {
  if (isWriting) focusEditor();
  if (!isPracticeBoard()) return;
  if (isWriting) {
    syncPracticeTextDraft();
    return;
  }
  practiceStore.clearTextDraft();
});

watchHelper.watchEveryEditModeChange(submitText);

// user clicked outside of text rect during edit
watchHelper.watchPointerEvent(
  ["TEXT_WRITING", "TEXT_SELECTED"],
  ["EV_SVG_POINTERDOWN"],
  resetTextEditingIfClickedOusideTextArea,
);

// user clicked inside text rect after text selection
watchHelper.watchPointerEvent(
  ["TEXT_SELECTED"],
  ["EV_SVG_POINTERUP"],
  editTextSelection,
);

// area selector signals the selected position
watchHelper.watchCustomEvent(
  ["TEXT_AREA_SELECTING"],
  "EV_AREA_SELECTION_DONE",
  startTextEditing,
);

watchHelper.watchPointerEvent(
  ["TEXT_WRITING"],
  ["EV_TEXT_EDITING"],
  editSelectedTextNotation,
);

watchHelper.watchCustomEvent(
  ["TEXT_WRITING"],
  "EV_SPECIAL_SYMBOL_SELECTED",
  addSpecialSymbol,
);

function editorRoot(): HTMLElement | null {
  return document.getElementById("textAreaRoot");
}

function setEditorBox(box: ViewportBox) {
  editorBox.value = {
    left: box.left,
    top: box.top,
    width: Math.max(minEditorWidth(), box.width),
    height: Math.max(minEditorHeight(), box.height),
  };
}

function minEditorWidth() {
  return Math.max(40, cellStore.getCellHorizontalWidth());
}

function minEditorHeight() {
  return Math.max(40, cellStore.getCellVerticalHeight());
}

function focusEditor() {
  nextTick(() => {
    document.getElementById("textAreaEl")?.focus();
  });
}

let editorResizeHandle: TextResizeHandle | null = null;
let editorResizeStartBox: ViewportBox | null = null;
let editorResizePointerId: number | null = null;
let editorResizeCaptureEl: HTMLElement | null = null;
const editorResizeStartPointer = { x: 0, y: 0 };

function startEditorResize(e: PointerEvent, handle: TextResizeHandle) {
  if (!authorizationHelper.canEdit()) return;
  const captureEl = e.currentTarget as HTMLElement | null;
  try {
    captureEl?.setPointerCapture?.(e.pointerId);
    editorResizeCaptureEl = captureEl;
    editorResizePointerId = e.pointerId;
  } catch {
    editorResizeCaptureEl = null;
    editorResizePointerId = null;
  }
  const rect = editorRoot()?.getBoundingClientRect();
  editorResizeHandle = handle;
  editorResizeStartBox = rect
    ? {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }
    : { ...editorBox.value };
  editorResizeStartPointer.x = e.clientX;
  editorResizeStartPointer.y = e.clientY;
  attachEditorResizeListeners();
}

function onEditorResizeMove(e: PointerEvent) {
  if (!editorResizeHandle || !editorResizeStartBox) return;
  if (e.buttons === 0) {
    endEditorResize();
    return;
  }
  setEditorBox(
    applyTextResizeHandle(
      editorResizeStartBox,
      editorResizeHandle,
      e.clientX,
      e.clientY,
      editorResizeStartPointer.x,
      editorResizeStartPointer.y,
      minEditorWidth(),
      minEditorHeight(),
    ),
  );
}

function endEditorResize() {
  detachEditorResizeListeners();
  if (!editorResizeHandle) return;
  if (
    editorResizeCaptureEl &&
    editorResizePointerId != null &&
    editorResizeCaptureEl.hasPointerCapture?.(editorResizePointerId)
  ) {
    try {
      editorResizeCaptureEl.releasePointerCapture(editorResizePointerId);
    } catch {
      /* already released */
    }
  }
  editorResizeHandle = null;
  editorResizeStartBox = null;
  editorResizeCaptureEl = null;
  editorResizePointerId = null;
  throttledSyncOutgoingChanges();
}

let editorResizeListening = false;

function attachEditorResizeListeners() {
  if (editorResizeListening) return;
  editorResizeListening = true;
  window.addEventListener("pointermove", onEditorResizeMove, true);
  window.addEventListener("pointerup", endEditorResize, true);
  window.addEventListener("pointercancel", endEditorResize, true);
}

function detachEditorResizeListeners() {
  if (!editorResizeListening) return;
  editorResizeListening = false;
  window.removeEventListener("pointermove", onEditorResizeMove, true);
  window.removeEventListener("pointerup", endEditorResize, true);
  window.removeEventListener("pointercancel", endEditorResize, true);
}

function editSelectedTextNotation() {
  if (!authorizationHelper.canEdit()) return;

  if (selectedNotation.value?.notationType !== "TEXT") {
    return;
  }

  editModeStore.setEditMode("TEXT_WRITING");
  setInitialTextValue();
  setInitialTextDimensions();
  hideTextNotation(selectedNotation.value.uuid);
  focusEditor();
}

// set text area dimensions upon notation selection
function setInitialTextDimensions() {
  if (!selectedNotation.value) return;

  const box = screenHelper.getTextNotationViewportBounds(selectedNotation.value);
  setEditorBox({
    left: box.left,
    top: box.top,
    width: box.right - box.left,
    height: box.bottom - box.top,
  });
}

function setInitialTextValue() {
  textValue.value = "";
  if (selectedNotation.value) {
    textValue.value = selectedNotation.value.value;
  }
}

function lessonTextSyncIds(): { userUUId: string; lessonUUId: string } | null {
  if (notationStore.getParent()?.type !== "LESSON") return null;
  const userUUId = userStore.getCurrentUser()?.uuid;
  const lessonUUId = lessonStore.getCurrentLesson()?.uuid;
  if (!userUUId || !lessonUUId) return null;
  return { userUUId, lessonUUId };
}

function SyncEndTextEdit() {
  const ids = lessonTextSyncIds();
  if (!ids) return;
  userOutgoingOperations.syncStopOutgoingTextSync(
    selectedNotation?.value?.uuid ?? null,
    ids.userUUId,
    ids.lessonUUId,
  );
}

function submitText(newEditMode: EditMode, oldEditMode: any) {
  if (newEditMode === "TEXT_WRITING" || oldEditMode !== "TEXT_WRITING") {
    return;
  }

  const editingUuid =
    selectedNotation.value?.notationType === "TEXT"
      ? selectedNotation.value.uuid
      : null;

  if (!authorizationHelper.canEdit()) {
    if (editingUuid) showTextNotation(editingUuid);
    editModeStore.setDefaultEditMode();
    return;
  }

  try {
    SyncEndTextEdit();
  } catch (error) {
    console.warn("text live-sync stop failed", error);
  }

  const textAreaEl = document.getElementById(
    "textAreaEl",
  ) as HTMLTextAreaElement | null;
  if (!textAreaEl) {
    if (editingUuid) showTextNotation(editingUuid);
    editModeStore.setDefaultEditMode();
    return;
  }

  editModeStore.setEditMode("CELL_SELECTED");

  try {
    const boxEl = editorRoot() ?? textAreaEl;
    const rect = boxEl.getBoundingClientRect();
    const topLeft = clientPointToSvgUser(rect.left, rect.top);
    const bottomRight = clientPointToSvgUser(rect.right, rect.bottom);

    const rectCoordinates = screenHelper.getRectAttributes({
      topLeft,
      bottomRight,
    });

    if (selectedNotation.value && rectCoordinates) {
      const updatedNotation = selectedNotation.value;
      updatedNotation.value = textValue.value;
      Object.assign(updatedNotation, rectCoordinates);

      notationMutateHelper.updateNotation(updatedNotation);
    } else {
      notationMutateHelper.addTextNotation(textValue.value, rectCoordinates);
    }
  } finally {
    if (editingUuid) showTextNotation(editingUuid);
    editModeStore.setDefaultEditMode();
  }
}

function hideTextNotation(uuid: string) {
  document
    .querySelector<HTMLElement>(`foreignObject[uuid="${uuid}"]`)
    ?.classList.add("hidden");
}

// restore text notation which was hideen during editing
function showTextNotation(uuid: string) {
  document
    .querySelector<HTMLElement>(`foreignObject[uuid="${uuid}"]`)
    ?.classList.remove("hidden");
}

function clickIsInsideTextUi(e: PointerEvent | TouchEvent): boolean {
  const raw =
    "changedTouches" in e && e.changedTouches[0]
      ? e.changedTouches[0].target
      : "touches" in e && e.touches[0]
        ? e.touches[0].target
        : e.target;
  const target = raw instanceof Element ? raw : null;
  if (target?.closest("#textAreaRoot, #selection, .text-resize-handle")) {
    return true;
  }
  if (selectedNotation.value?.notationType !== "TEXT") return false;
  const point =
    e instanceof PointerEvent
      ? { x: e.clientX, y: e.clientY }
      : "changedTouches" in e && e.changedTouches[0]
        ? { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
        : null;
  if (!point) return false;
  return screenHelper.isClickedPointInsideText(point, selectedNotation.value);
}

function resetTextEditingIfClickedOusideTextArea(e: PointerEvent | TouchEvent) {
  if (clickIsInsideTextUi(e)) return;
  editModeStore.setDefaultEditMode();
}

function editTextSelection(e: PointerEvent | TouchEvent) {
  if (!authorizationHelper.canEdit()) return;
  if (editorResizeHandle) return;

  const el = (
    "changedTouches" in e && e.changedTouches[0]
      ? e.changedTouches[0].target
      : e.target
  ) as HTMLElement | null;
  if (!el) return;
  if (el.closest(".text-resize-handle")) return;
  if (
    !el.closest("#selection") &&
    el.tagName !== "TEXTAREA" &&
    !el.closest("#textAreaRoot")
  ) {
    return;
  }
  editModeStore.setEditMode("TEXT_WRITING");

  const rect = (el.closest("#selection") ?? el).getBoundingClientRect();

  startTextEditing({
    topLeft: {
      x: rect.left,
      y: rect.top,
    },
    bottomRight: {
      x: rect.right,
      y: rect.bottom,
    },
  });

  if (selectedNotation.value) hideTextNotation(selectedNotation.value.uuid);
}

function startTextEditing(selectionCoordinates: RectCoordinates) {
  if (!authorizationHelper.canEdit()) return;

  setInitialTextValue();
  setEditorBox({
    left: selectionCoordinates.topLeft.x,
    top: selectionCoordinates.topLeft.y,
    width:
      selectionCoordinates.bottomRight.x - selectionCoordinates.topLeft.x,
    height:
      selectionCoordinates.bottomRight.y - selectionCoordinates.topLeft.y,
  });
  focusEditor();
}

function syncOutgoingChanges() {
  if (!authorizationHelper.canEdit()) return;
  const ids = lessonTextSyncIds();
  if (!ids) return;
  userOutgoingOperations.syncOutgoingTextSync(
    selectedNotation?.value?.uuid ?? null,
    ids.userUUId,
    ids.lessonUUId,
    textValue.value,
    editorBox.value.left,
    editorBox.value.top,
    editorBox.value.width,
    editorBox.value.height,
  );
}

const throttledSyncOutgoingChanges = throttle(syncOutgoingChanges, 2000);

function addSpecialSymbol(symbol: String): void {
  if (!symbol) return;
  const textArea = document.getElementById("textAreaEl") as HTMLTextAreaElement;

  // Get cursor position
  const start = textArea.selectionStart;
  const end = textArea.selectionEnd;

  // Create a temporary div to decode HTML entities
  const decoder = document.createElement("div");
  decoder.innerHTML = symbol.toString();
  const decodedSymbol = decoder.textContent || decoder.innerText;

  // Insert decoded symbol at cursor position
  textValue.value =
    textValue.value.substring(0, start) +
    decodedSymbol +
    textValue.value.substring(end);

  // Reset cursor position after symbol
  setTimeout(() => {
    textArea.focus();
    textArea.setSelectionRange(
      start + decodedSymbol.length,
      start + decodedSymbol.length,
    );
  }, 0);
}
</script>
<style>
.freeTextRoot {
  position: fixed;
  z-index: 1100;
  box-sizing: border-box;
  pointer-events: auto;
}
.freeText {
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  background-color: rgb(232, 232, 215);
  padding: 5px;
  box-sizing: border-box;
  resize: none;
  overflow: auto;
  border: groove 2px;
  pointer-events: auto;
  user-select: text;
  -webkit-user-select: text;
}
.hidden {
  display: none;
}
</style>
