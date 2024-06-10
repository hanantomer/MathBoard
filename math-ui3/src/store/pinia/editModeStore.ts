import { defineStore } from "pinia";
import { EditMode, EditModeNotationType, NotationType } from "common/unions";
import { ref } from "vue";

export const useEditModeStore = defineStore("editMode", () => {
  let editMode = ref<EditMode>("SYMBOL");

  const defaultEditMode: EditMode = "SYMBOL";

  function isAreaSelectionOrMovingMode() {
    return (
      editMode.value == "AREA_SELECTING" ||
      editMode.value == "AREA_SELECTED" ||
      editMode.value == "TEXT_AREA_SELECTING" ||
      editMode.value == "MOVING"
    );
  }

  function isSelectionMode() {
    return editMode.value == "AREA_SELECTING" || editMode.value == "MOVING";
  }

  function isSelectedMode() {
    return (
      editMode.value == "AREA_SELECTED" ||
      editMode.value == "HORIZONTAL_LINE_SELECTED" ||
      editMode.value == "SQRT_SELECTED"
    );
  }

  function isSelectFromListMode() {
    return (
      editMode.value == "LESSONS_SELECTION" ||
      editMode.value == "QUESTIONS_SELECTION" ||
      editMode.value == "ANSWERS_SELECTION"
    );
  }

  function isLineMode() {
    return (
      isHorizontalLineMode() ||
      isVerticalLineMode() ||
      isSlopeLineMode() ||
      isSqrtMode()
    );
  }

  // function isLineStartedMode() {
  //   return (
  //     editMode.value == "HORIZONTAL_LINE_STARTED" ||
  //     editMode.value == "VERTICAL_LINE_STARTED" ||
  //     editMode.value == "SLOPE_LINE_STARTED"
  //   );
  // }

  function isHorizontalLineMode() {
    return (
      editMode.value == "HORIZONTAL_LINE_STARTED" ||
      editMode.value == "HORIZONTAL_LINE_DRAWING"
    );
  }

  function isVerticalLineMode() {
    return (
      editMode.value == "VERTICAL_LINE_STARTED" ||
      editMode.value == "VERTICAL_LINE_DRAWING"
    );
  }

  function isSlopeLineMode() {
    return (
      editMode.value == "SLOPE_LINE_STARTED" ||
      editMode.value == "SLOPE_LINE_DRAWING"
    );
  }

  function isSqrtMode() {
    return editMode.value == "SQRT_STARTED" || editMode.value == "SQRT_DRAWING";
  }

  function isDefaultEditMode() {
    return editMode.value === defaultEditMode;
  }

  function isSqrtEditMode() {
    return editMode.value === "SQRT_DRAWING";
  }

  function isHorizontalLineDrawingMode() {
    return (
      editMode.value == "HORIZONTAL_LINE_DRAWING" ||
      editMode.value == "SQRT_DRAWING"
    );
  }

  function isHorizontalLineStartedMode() {
    return editMode.value == "HORIZONTAL_LINE_STARTED";
  }

  function isSlopeLineStartedMode() {
    return editMode.value == "SLOPE_LINE_STARTED";
  }

  function isSqrtStartedMode() {
    return editMode.value == "SQRT_STARTED";
  }

  function isVerticalLineStartedMode() {
    return editMode.value == "VERTICAL_LINE_STARTED";
  }

  function isVerticalLineDrawingMode() {
    return editMode.value == "VERTICAL_LINE_DRAWING";
  }

  function isSlopeLineDrawingMode() {
    return editMode.value == "SLOPE_LINE_DRAWING";
  }

  function isHorizontalLineSelectedMode() {
    return (
      editMode.value == "HORIZONTAL_LINE_SELECTED" ||
      editMode.value == "SQRT_SELECTED"
    );
  }

  function isVerticalLineSelectedMode() {
    return editMode.value == "VERTICAL_LINE_SELECTED";
  }

  function isSlopeLineSelectedMode() {
    return editMode.value == "SLOPE_LINE_SELECTED";
  }

  function isTextStartedMode() {
    return editMode.value === "TEXT_STARTED";
  }

  function isTextSelectedMode() {
    return editMode.value === "TEXT_SELECTED";
  }

  function isTextWritingMode() {
    return editMode.value === "TEXT_WRITING";
  }

  function isExponentMode() {
    return editMode.value == "EXPONENT_STARTED";
  }

  function isCheckMode() {
    return (
      editMode.value == "CHECKMARK_STARTED" ||
      editMode.value == "SEMICHECKMARK_STARTED" ||
      editMode.value == "XMARK_STARTED"
    );
  }

  function isColorisingMode() {
    return editMode.value === "COLORISING";
  }

  function getEditMode(): EditMode {
    return editMode.value;
  }

  function getDefaultEditMode() {
    return defaultEditMode;
  }

  function setEditMode(newEditMode: EditMode) {
    console.debug("new edit mode:" + newEditMode);
    editMode.value = newEditMode;
  }

  function setDefaultEditMode() {
    setEditMode(defaultEditMode);
  }

  function setNextEditMode() {
    switch (editMode.value) {
      case "TEXT_STARTED":
        return setEditMode("TEXT_AREA_SELECTING");
      case "TEXT_AREA_SELECTING":
        return setEditMode("TEXT_WRITING");

      case "HORIZONTAL_LINE_STARTED":
        return setEditMode("HORIZONTAL_LINE_DRAWING");
      case "HORIZONTAL_LINE_SELECTED":
        return setEditMode("HORIZONTAL_LINE_DRAWING");

      case "VERTICAL_LINE_STARTED":
        return setEditMode("VERTICAL_LINE_DRAWING");
      case "VERTICAL_LINE_SELECTED":
        return setEditMode("VERTICAL_LINE_DRAWING");

      case "SLOPE_LINE_STARTED":
        return setEditMode("SLOPE_LINE_DRAWING");
      case "SLOPE_LINE_SELECTED":
        return setEditMode("SLOPE_LINE_DRAWING");

      case "SQRT_STARTED":
        return setEditMode("SQRT_DRAWING");
      case "SQRT_SELECTED":
        return setEditMode("SQRT_DRAWING");

      case "AREA_SELECTING":
        return setEditMode("AREA_SELECTED");
      case "AREA_SELECTED":
        return setEditMode("MOVING");
      //case "MOVING":
      //  return setDefaultEditMode();
      default:
        return setDefaultEditMode();
    }
  }

  function getNotationTypeByEditMode(): NotationType {
    return EditModeNotationType.get(getEditMode())!;
  }

  return {
    getEditMode,
    getDefaultEditMode,
    getNotationTypeByEditMode,
    isAreaSelectionOrMovingMode,
    isSelectionMode,
    isLineMode,
    isHorizontalLineMode,
    isHorizontalLineSelectedMode,
    isSqrtStartedMode,
    isHorizontalLineStartedMode,
    isHorizontalLineDrawingMode,
    isVerticalLineMode,
    isVerticalLineSelectedMode,
    isVerticalLineStartedMode,
    isVerticalLineDrawingMode,
    isSlopeLineMode,
    isSlopeLineSelectedMode,
    isSlopeLineStartedMode,
    isSlopeLineDrawingMode,
    isSelectedMode,
    isSqrtMode,
    isSqrtEditMode,
    isExponentMode,
    isColorisingMode,
    isDefaultEditMode,
    isTextWritingMode,
    isTextStartedMode,
    isTextSelectedMode,
    isCheckMode,
    isSelectFromListMode,
    setEditMode,
    setNextEditMode,
    setDefaultEditMode,
  };
});
