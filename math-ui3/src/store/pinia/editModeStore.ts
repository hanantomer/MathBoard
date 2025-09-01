import { defineStore } from "pinia";
import { EditMode, EditModeNotationType, NotationType } from "common/unions";
import { ref } from "vue";

export const useEditModeStore = defineStore("editMode", () => {
  let editMode = ref<EditMode>("CELL_SELECTED");

  const defaultEditMode: EditMode = "CELL_SELECTED";

  function isAreaSelectionOrMovingMode() {
    return (
      editMode.value === "AREA_SELECTING" ||
      editMode.value === "AREA_SELECTED" ||
      editMode.value === "TEXT_AREA_SELECTING" ||
      editMode.value === "AREA_MOVING"
    );
  }

  function isCurveEditingControlPointMode() {
    return editMode.value === "CURVE_EDITING_CONTROLֹ_POINT";
  }

  function isResizeMode() {
    return editMode.value === "RESIZE_STARTED" || editMode.value === "RESIZING";
  }

  function isAreaSelectedMode() {
    return editMode.value === "AREA_SELECTED";
  }

  function isSelectionMode() {
    return (
      editMode.value === "AREA_SELECTING" || editMode.value === "AREA_MOVING"
    );
  }

  function isSelectedMode() {
    return (
      editMode.value === "CIRCLE_SELECTED" ||
      editMode.value === "AREA_SELECTED" ||
      editMode.value === "LINE_SELECTED" ||
      editMode.value === "SQRT_SELECTED"
    );
  }

  function isSelectFromListMode() {
    return (
      editMode.value === "LESSONS_SELECTION" ||
      editMode.value === "QUESTIONS_SELECTION" ||
      editMode.value === "ANSWERS_SELECTION"
    );
  }

  function isLineMode() {
    return (
      editMode.value === "LINE_DRAWING" ||
      editMode.value === "LINE_SELECTED" ||
      editMode.value === "LINE_EDITING_LEFT" ||
      editMode.value === "LINE_EDITING_RIGHT"
    );
  }

  function isPolygonDrawingMode() {
    return editMode.value === "POLYGON_DRAWING";
  }

  //function isPolygonLineEndedMode() {
  //  return editMode.value === "POLYGON_LINE_ENDED";
  //}

  function isSqrtMode() {
    return (
      editMode.value === "SQRT_STARTED" ||
      editMode.value === "SQRT_DRAWING" ||
      editMode.value === "SQRT_SELECTED"
    );
  }

  function isDefaultEditMode() {
    return editMode.value === defaultEditMode;
  }

  function isSqrtEditMode() {
    return editMode.value === "SQRT_EDITING";
  }

  function isSqrtSelectedMode() {
    return editMode.value === "SQRT_SELECTED";
  }

  function isSqrtDrawingMode() {
    return editMode.value === "SQRT_DRAWING";
  }

  function isLineStartedMode() {
    return editMode.value === "LINE_STARTED";
  }

  function isCurveStartedMode() {
    return editMode.value === "CURVE_STARTED";
  }

  function isSqrtStartedMode() {
    return editMode.value === "SQRT_STARTED";
  }

  function isLineDrawingMode() {
    return editMode.value === "LINE_DRAWING";
  }

  function isLineEditingMode() {
    return (
      editMode.value === "LINE_EDITING_LEFT" ||
      editMode.value === "LINE_EDITING_RIGHT"
    );
  }

  function isCurveDrawingMode() {
    return (
      editMode.value === "CURVE_DRAWING" ||
      editMode.value === "CURVE_EDITING_LEFT" ||
      editMode.value === "CURVE_EDITING_RIGHT" ||
      editMode.value === "CURVE_EDITING_CONTROLֹ_POINT"
    );
  }

  function isCircleDrawingMode() {
    return (
      editMode.value === "CIRCLE_DRAWING" || editMode.value === "CIRCLE_EDITING"
    );
  }

  function isLineSelectedMode() {
    return editMode.value === "LINE_SELECTED";
  }

  function isCurveSelectedMode() {
    return editMode.value === "CURVE_SELECTED";
  }

  function isCircleSelectedMode() {
    return editMode.value === "CIRCLE_SELECTED";
  }

  function isTextStartedMode() {
    return editMode.value === "TEXT_STARTED";
  }

  function isTextSelectedMode() {
    return editMode.value === "TEXT_SELECTED";
  }

  function isTextSelectionMode() {
    return editMode.value === "TEXT_AREA_SELECTING";
  }

  function isTextWritingMode() {
    return editMode.value === "TEXT_WRITING";
  }

  function isAnnotationStartedMode() {
    return editMode.value === "ANNOTATION_STARTED";
  }

  function isAnnotationSelectedMode() {
    return editMode.value === "ANNOTATION_SELECTED";
  }

  function isAnnotationWritingMode() {
    return editMode.value === "ANNOTATION_WRITING";
  }

  function isExponentStartedMode() {
    return editMode.value === "EXPONENT_STARTED";
  }

  function isExponentWritingMode() {
    return editMode.value === "EXPONENT_WRITING";
  }

  function isExponentMode() {
    return (
      editMode.value === "EXPONENT_STARTED" ||
      editMode.value === "EXPONENT_WRITING" ||
      editMode.value === "EXPONENT_SELECTED"
    );
  }

  function isCheckMode() {
    return (
      editMode.value === "CHECKMARK_STARTED" ||
      editMode.value === "SEMICHECKMARK_STARTED" ||
      editMode.value === "XMARK_STARTED"
    );
  }

  function isColorizingMode() {
    return editMode.value === "COLORIZING";
  }

  function getEditMode(): EditMode {
    return editMode.value;
  }

  function getDefaultEditMode() {
    return defaultEditMode;
  }

  function setEditMode(newEditMode: EditMode) {
    console.debug(
      `old edit mode: ${editMode.value}, new edit mode: ${newEditMode} `,
    );
    console.trace();
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

      case "ANNOTATION_STARTED":
        return setEditMode("ANNOTATION_WRITING");

      case "EXPONENT_STARTED":
        return setEditMode("EXPONENT_WRITING");

      case "POLYGON_STARTED":
        return setEditMode("POLYGON_DRAWING");

      //      case "POLYGON_DRAWING":
      //        return setEditMode("POLYGON_LINE_ENDED");

      case "LINE_STARTED":
        return setEditMode("LINE_DRAWING");

      case "LINE_DRAWING":
        return setEditMode("LINE_SELECTED");

      case "LINE_EDITING_LEFT":
        return setEditMode("LINE_SELECTED");

      case "LINE_EDITING_RIGHT":
        return setEditMode("LINE_SELECTED");

      case "CURVE_STARTED":
        return setEditMode("CURVE_DRAWING");
      case "CURVE_DRAWING":
        return setEditMode("CURVE_SELECTED");

      case "CURVE_EDITING_LEFT":
        return setEditMode("CURVE_SELECTED");

      case "CURVE_EDITING_RIGHT":
        return setEditMode("CURVE_SELECTED");

      case "CURVE_EDITING_CONTROLֹ_POINT":
        return setEditMode("CURVE_SELECTED");

      case "CIRCLE_STARTED":
        return setEditMode("CIRCLE_DRAWING");

      case "CIRCLE_DRAWING":
        return setEditMode("CIRCLE_SELECTED");

      case "CIRCLE_EDITING":
        return setEditMode("CIRCLE_SELECTED");

      case "SQRT_STARTED":
        return setEditMode("SQRT_DRAWING");

      case "SQRT_DRAWING":
        return setEditMode("SQRT_SELECTED");

      case "SQRT_EDITING":
        return setEditMode("SQRT_SELECTED");

      case "AREA_SELECTING":
        return setEditMode("AREA_SELECTED");

      case "AREA_SELECTED":
        return setEditMode("AREA_MOVING");

      case "RESIZING":
        return setEditMode("RESIZE_STARTED");

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
    isAreaSelectedMode,
    isAreaSelectionOrMovingMode,
    isExponentMode,
    isExponentStartedMode,
    isExponentWritingMode,
    isSelectionMode,
    isLineMode,
    isSqrtStartedMode,
    isSqrtDrawingMode,
    isLineSelectedMode,
    isCurveSelectedMode,
    isLineStartedMode,
    isCurveStartedMode,
    isLineDrawingMode,
    isLineEditingMode,
    isCurveDrawingMode,
    isCircleDrawingMode,
    isCircleSelectedMode,
    isSelectedMode,
    isSqrtMode,
    isSqrtEditMode,
    isSqrtSelectedMode,
    isColorizingMode,
    isDefaultEditMode,
    isTextWritingMode,
    isTextStartedMode,
    isTextSelectedMode,
    isTextSelectionMode,
    isAnnotationWritingMode,
    isAnnotationStartedMode,
    isAnnotationSelectedMode,
    isCheckMode,
    isResizeMode,
    isSelectFromListMode,
    isPolygonDrawingMode,
    //isPolygonLineEndedMode,
    isCurveEditingControlPointMode,
    setEditMode,
    setNextEditMode,
    setDefaultEditMode,
  };
});
