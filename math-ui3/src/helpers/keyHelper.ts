import { useEditModeStore } from "../store/pinia/editModeStore";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import useMatrixCellHelper from "../helpers/matrixCellHelper";
import useAuthorizationHelper from "../helpers/authorizationHelper";
import useNotationMutateHelper from "../helpers/notationMutateHelper";
import useSelectionHelper from "../helpers/selectionHelper";
import useEventBus from "../helpers/eventBusHelper";
type keyType = "SYMBOL" | "MOVEMENT" | "DELETION" | "MOVEANDDELETE" | "PUSH";

const editModeStore = useEditModeStore();
const cellStore = useCellStore();
const notationStore = useNotationStore();
const matrixCellHelper = useMatrixCellHelper();
const authorizationHelper = useAuthorizationHelper();
const notationMutateHelper = useNotationMutateHelper();
const selectionHelper = useSelectionHelper();
const eventBus = useEventBus();

const KEY_STROKE_INTERVAL = 50; // ms
const META_KEY_CODES = new Set(["MetaLeft", "MetaRight", "OSLeft", "OSRight"]);
const META_SUPPRESS_MS = 400;
let shiftReleaseTime = 0;
let shiftReleased = false;
let altReleaseTime = 0;
let altReleased = false;
let isKeyUpHandlerRunning = false; // Prevent concurrent execution
let lastKeyUpToken = "";
let lastKeyUpAt = 0;
let mobileEscapeTriggered = false;
let metaHeld = false;
let metaReleasedAt = 0;
let lastMetaKeyDownAt = 0;
let osShortcutListenersBound = false;
const keysPressedWithMeta = new Set<string>();
const delayedAltKeys = new Set<string>(["x", "l"]);

function isMetaLikeKey(e: KeyboardEvent): boolean {
  return META_KEY_CODES.has(e.code) || e.key === "Meta" || e.key === "OS";
}

function isMetaModifierActive(e: KeyboardEvent): boolean {
  return (
    e.metaKey || e.getModifierState("Meta") || e.getModifierState("OS")
  );
}

function isWindowsPlatform(): boolean {
  return (
    typeof navigator !== "undefined" &&
    /Win/i.test(navigator.platform || navigator.userAgent)
  );
}

function onOsShortcutKeyDown(e: KeyboardEvent) {
  if (isMetaLikeKey(e)) {
    metaHeld = true;
    lastMetaKeyDownAt = Date.now();
    return;
  }
  if (isMetaModifierActive(e) || metaHeld) {
    keysPressedWithMeta.add(e.code);
    // Windows may swallow Win keyup (Win+V / Win+K); don't stay "held" forever.
    if (!isMetaModifierActive(e)) {
      metaHeld = false;
      metaReleasedAt = Date.now();
    }
    return;
  }
  if (
    isWindowsPlatform() &&
    lastMetaKeyDownAt > 0 &&
    Date.now() - lastMetaKeyDownAt < META_SUPPRESS_MS
  ) {
    keysPressedWithMeta.add(e.code);
  }
}

function onOsShortcutKeyUp(e: KeyboardEvent) {
  if (!isMetaLikeKey(e)) return;
  metaHeld = false;
  metaReleasedAt = Date.now();
}

function onOsShortcutBlur() {
  if (metaHeld) {
    metaReleasedAt = Date.now();
  }
  metaHeld = false;
}

function bindOsShortcutListeners() {
  if (osShortcutListenersBound || typeof window === "undefined") return;
  osShortcutListenersBound = true;
  window.addEventListener("keydown", onOsShortcutKeyDown, true);
  window.addEventListener("keyup", onOsShortcutKeyUp, true);
  window.addEventListener("blur", onOsShortcutBlur);
}

function shouldIgnoreOsShortcutSymbol(e: KeyboardEvent): boolean {
  if (isMetaLikeKey(e)) return true;
  const chorded = keysPressedWithMeta.has(e.code);
  keysPressedWithMeta.delete(e.code);
  if (isMetaModifierActive(e) || metaHeld || chorded) return true;
  if (typeof document !== "undefined" && !document.hasFocus()) return true;
  // Windows often drops metaKey before Win+V / Win+K keyup, so "v" would be typed.
  return (
    isWindowsPlatform() &&
    (Date.now() - metaReleasedAt < META_SUPPRESS_MS ||
      Date.now() - lastMetaKeyDownAt < META_SUPPRESS_MS)
  );
}

const delayedShiftKeys = new Map<string, string>([
  ["1", "!"],
  ["5", "%"],
  ["2", "@"],
  ["3", "#"],
  ["4", "$"],
  ["7", "&"],
  ["6", "^"],
  ["8", "*"],
  ["9", "("],
  ["8", "*"],
  ["9", "("],
  ["0", ")"],
  ["-", "_"],
  ["0", ")"],
  ["=", "+"],
  ["[", "{"],
  ["]", "}"],
  [";", ":"],
  ["'", '"'],
  ["<", ","],
  [">", "."],
  ["/", "?"],
  [",", "<"],
  [".", ">"],
  ["/", "?"],
]);

export default function () {
  bindOsShortcutListeners();

  // Listen for mobile escape event
  eventBus.on("EV_MOBILE_ESCAPE", () => {
    mobileEscapeTriggered = true;
    // Trigger the escape logic
    handleEscapeAction();
    mobileEscapeTriggered = false;
  });

  function handleEscapeAction() {
    if (
      editModeStore.isArmedToolMode() ||
      editModeStore.getGlobalEditMode() !== "TEXT"
    ) {
      editModeStore.setDefaultEditMode();
    }
  }

  function keyDownHandler(e: KeyboardEvent) {
    const { key } = e;

    console.log("KeyDown:", {
      key,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      shiftKey: e.shiftKey,
      code: e.code,
    });
    if (delayedShiftKeys.has(key) && shiftReleased) {
      shiftReleased = false;
    }
  }

  async function keyUpHandler(e: KeyboardEvent) {
    // Prevent concurrent / duplicate delivery of the same keyup
    if (isKeyUpHandlerRunning) return;
    const dedupeToken = `${e.timeStamp}:${e.code}:${e.key}`;
    if (
      dedupeToken === lastKeyUpToken &&
      Date.now() - lastKeyUpAt < KEY_STROKE_INTERVAL
    ) {
      return;
    }
    lastKeyUpToken = dedupeToken;
    lastKeyUpAt = Date.now();
    isKeyUpHandlerRunning = true;

    try {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      if (target?.closest?.("[data-cy='cell-symbol-input']")) return;

      if (
        (e.ctrlKey && e.key === "y") ||
        (e.ctrlKey && e.shiftKey && e.key === "Z")
      ) {
        e.preventDefault();
        notationStore.redo();
      }

      if (
        (e.ctrlKey || e.metaKey) &&
        (e.code === "keyZ" || e.key === "z") &&
        !e.shiftKey
      ) {
        e.preventDefault();
        notationStore.undo();
      }

      const { ctrlKey, altKey, code, key } = e;

      if (!authorizationHelper.canEdit()) return;

      if (code === "ShiftLeft" || code === "ShiftRight") {
        shiftReleased = true;
        shiftReleaseTime = Date.now();
        return;
      }

      if (code === "AltLeft" || code === "AltRight") {
        altReleased = true;
        altReleaseTime = Date.now();
        return;
      }

      let usePreviousShift = false;
      if (
        shiftReleased &&
        Date.now() - shiftReleaseTime < KEY_STROKE_INTERVAL
      ) {
        usePreviousShift = true;
        shiftReleased = false;
      }

      let usePreviousAlt = false;
      if (altReleased && Date.now() - altReleaseTime < KEY_STROKE_INTERVAL) {
        usePreviousAlt = true;
        altReleased = false;
      }

      if (code === "Escape") {
        handleEscapeAction();
        return;
      }

      if (editModeStore.getEditMode() === "TEXT_WRITING") return;

      if (editModeStore.getEditMode() === "ANNOTATION_WRITING") return;

      if (editModeStore.getEditMode() === "EXPONENT_WRITING") return;

      if (ctrlKey || altKey || shouldIgnoreOsShortcutSymbol(e)) {
        return;
      }

      const keyKind = classifyKeyCode(code);
      if (editModeStore.isArmedToolMode()) {
        // Space keeps its push meaning only in cell/selection modes.
        if (keyKind === "PUSH" || keyKind === null) return;
        editModeStore.setDefaultEditMode();
        if (keyKind !== "SYMBOL") return;
      }

      const noNotationsSelected =
        notationStore.getSelectedNotations().length === 0;

      const singleSymbolSelected =
        notationStore.getSelectedNotations().length === 1 &&
        notationStore.getSelectedNotations().at(0)?.notationType === "SYMBOL";

      switch (keyKind) {
        case "PUSH": {
          return handlePushKey();
        }

        case "DELETION": {
          await notationMutateHelper.deleteSelectedNotations();
          if (singleSymbolSelected || noNotationsSelected) {
            await notationMutateHelper.collapseNotationsToSelectedCell();
            matrixCellHelper.setNextCell(0, 0);
            selectCurrentCellNotation();
            editModeStore.setDefaultEditMode();
          }
          break;
        }

        case "MOVEMENT": {
          return handleMovementKey(code);
        }

        case "MOVEANDDELETE": {
          handleMovementKey(code);
          await notationMutateHelper.deleteSelectedNotations();
          return;
        }

        case "SYMBOL": {
          if (altKey || (usePreviousAlt && delayedAltKeys.has(key))) {
            if (key === "x") {
              return editModeStore.setEditMode("EXPONENT_STARTED");
            }
            if (key === "l") {
              return editModeStore.setEditMode("LOG_STARTED");
            }
          }
          if (usePreviousShift && delayedShiftKeys.has(key)) {
            return notationMutateHelper.addSymbolNotation(
              delayedShiftKeys.get(key)!,
            );
          }
          return notationMutateHelper.addSymbolNotation(key);
        }
      }
    } finally {
      isKeyUpHandlerRunning = false;
    }
  }

  async function handlePushKey() {
    await notationMutateHelper.handleSpaceOnSelectedCell();
  }

  function handleMovementKey(key: string) {
    if (!editModeStore.getEditMode().endsWith("SELECTED")) {
      return;
    }

    if (key === "ArrowLeft" || key === "Backspace") {
      matrixCellHelper.setNextCell(-1, 0);
    }

    if (key === "ArrowRight" || key === "Space") {
      matrixCellHelper.setNextCell(1, 0);
    }

    if (key === "ArrowUp") {
      matrixCellHelper.setNextCell(0, -1);
    }

    if (key === "ArrowDown") {
      matrixCellHelper.setNextCell(0, 1);
    }

    if (key === "Enter") {
      matrixCellHelper.setNextCell(0, -1);
    }

    selectCurrentCellNotation();
  }

  // select a notation occupied by selected cell
  function selectCurrentCellNotation() {
    selectionHelper.selectNotationAtPosition({
      x:
        cellStore.getSvgBoundingRect().left +
        cellStore.getSelectedCell()?.col! * cellStore.getCellHorizontalWidth(),
      y:
        cellStore.getSvgBoundingRect().top +
        cellStore.getSelectedCell()?.row! * cellStore.getCellVerticalHeight(),
    });
  }

  function classifyKeyCode(code: string): keyType | null {
    if (code === "Space") return "PUSH";

    if (
      code === "ArrowLeft" ||
      code === "ArrowRight" ||
      code === "ArrowUp" ||
      code === "ArrowDown"
    )
      return "MOVEMENT";

    if (
      code.startsWith("Digit") ||
      code.startsWith("Key") ||
      code.startsWith("Numpad") ||
      code === "Minus" ||
      code === "Plus" ||
      code === "Equal" ||
      code === "Slash" ||
      code === "Comma" ||
      code === "Backquote" ||
      code === "ShiftRight" ||
      code === "ShiftLeft" ||
      code === "Semicolon" ||
      code === "Colon" ||
      code === "Quote" ||
      code === "Backslash" ||
      code === "BracketLeft" ||
      code === "BracketRight" ||
      code === "Period"
    )
      return "SYMBOL";

    if (code === "Delete") return "DELETION";

    if (code === "Backspace") return "MOVEANDDELETE";

    return null;
  }

  return {
    keyUpHandler,
    keyDownHandler,
  };
}
