import { defineStore } from "pinia";
import { EditMode } from "common/unions";
import { ref } from "vue";

export const useEditModeStore = defineStore("editMode", () => {
  let editMode = ref<EditMode>();

  const defaultEditMode: EditMode = "SYMBOL";

  function isAreaSelectionMode() {
    return (
      editMode.value == "AREA_SELECTING" || editMode.value == "AREA_SELECTED"
    );
  }

  function isSelectionMode() {
    return (
      editMode.value == "AREA_SELECT" ||
      editMode.value == "AREA_SELECTING" ||
      editMode.value == "MOVING"
    );
  }

  function isSelectedMode() {
    return (
      editMode.value == "AREA_SELECTED" ||
      editMode.value == "FRACTION_SELECTED" ||
      editMode.value == "SQRT_SELECTED"
    );
  }

  function isLineMode() {
    return isFractionMode() || isSqrtMode();
  }

  function isFractionMode() {
    return editMode.value == "FRACTION" || editMode.value == "FRACTION_DRAWING";
  }

  function isSqrtMode() {
    return editMode.value == "SQRT" || editMode.value == "SQRT_DRAWING";
  }

  function isDefaultEditMode() {
    return editMode.value === defaultEditMode;
  }

  function isSqrtEditMode() {
    return editMode.value === "SQRT_DRAWING";
  }

  function isLineDrawingMode() {
    return (
      editMode.value == "FRACTION_DRAWING" || editMode.value == "SQRT_DRAWING"
    );
  }

  function isLineSelectedMode() {
    return (
      editMode.value == "FRACTION_SELECTED" || editMode.value == "SQRT_SELECTED"
    );
  }

  function isTextMode() {
    return editMode.value == "TEXT";
  }

  function getEditMode() {
    return editMode.value;
  }

  function getDefaultEditMode() {
    return defaultEditMode;
  }

  function setEditMode(newEditMode: EditMode) {
    //console.debug("new edit mode:" + newEditMode);
    editMode.value = newEditMode;
  }

  function resetEditMode() {
    setEditMode(defaultEditMode);
  }

  function setNextEditMode() {
    switch (editMode.value) {
      case "FRACTION":
        return setEditMode("FRACTION_DRAWING");
      case "SQRT":
        return setEditMode("SQRT_DRAWING");
      case "FRACTION_SELECTED":
        return setEditMode("FRACTION_DRAWING");
      case "SQRT_SELECTED":
        return setEditMode("SQRT_DRAWING");
      case "AREA_SELECT":
        return setEditMode("AREA_SELECTING");
      case "AREA_SELECTING":
        return setEditMode("AREA_SELECTED");
      case "AREA_SELECTED":
        return setEditMode("MOVING");
      case "MOVING":
        return resetEditMode();
    }
  }

  return {
    getEditMode,
    getDefaultEditMode,
    isAreaSelectionMode,
    isSelectionMode,
    isLineMode,
    isLineDrawingMode,
    isLineSelectedMode,
    isSelectedMode,
    isFractionMode,
    isSqrtMode,
    isSqrtEditMode,
    isDefaultEditMode,
    isTextMode,
    setEditMode,
    setNextEditMode,
    resetEditMode,
  };
});
