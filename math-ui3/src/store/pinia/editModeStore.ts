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
      editMode.value === "AREA_SELECTED" ||
      editMode.value === "HORIZONTAL_LINE_SELECTED" ||
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
      isHorizontalLineMode() ||
      isVerticalLineMode() ||
      isSlopeLineMode() ||
      isSqrtMode()
    );
  }

  function isHorizontalLineMode() {
    return (
      editMode.value === "HORIZONTAL_LINE_STARTED" ||
      editMode.value === "HORIZONTAL_LINE_DRAWING" ||
      editMode.value === "HORIZONTAL_LINE_EDITING_LEFT" ||
      editMode.value === "HORIZONTAL_LINE_EDITING_RIGHT"
    );
  }

  function isVerticalLineMode() {
    return (
      editMode.value === "VERTICAL_LINE_STARTED" ||
      editMode.value === "VERTICAL_LINE_DRAWING" ||
      editMode.value === "VERTICAL_LINE_EDITING_BOTTOM" ||
      editMode.value === "VERTICAL_LINE_EDITING_TOP"
    );
  }

  function isSlopeLineMode() {
    return (
      editMode.value === "POLYGON_STARTED" ||
      editMode.value === "SLOPE_LINE_STARTED" ||
      editMode.value === "SLOPE_LINE_DRAWING" ||
      editMode.value === "SLOPE_LINE_EDITING_LEFT" ||
      editMode.value === "SLOPE_LINE_EDITING_RIGHT"
    );
  }

  function isPolygonDrawingMode() {
    return (
      editMode.value === "POLYGON_DRAWING"
    );
  }


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

  function isHorizontalLineDrawingMode() {
    return editMode.value === "HORIZONTAL_LINE_DRAWING";
  }

  function isHorizontalLineEditingMode() {
    return (
      editMode.value === "HORIZONTAL_LINE_EDITING_LEFT" ||
      editMode.value === "HORIZONTAL_LINE_EDITING_RIGHT"
    );
  }

  function isVerticalLineEditingMode() {
    return (
      editMode.value === "VERTICAL_LINE_EDITING_TOP" ||
      editMode.value === "VERTICAL_LINE_EDITING_BOTTOM"
    );
  }

  function isSqrtDrawingMode() {
    return editMode.value === "SQRT_DRAWING";
  }

  function isHorizontalLineStartedMode() {
    return editMode.value === "HORIZONTAL_LINE_STARTED";
  }

  function isSlopeLineStartedMode() {
    return editMode.value === "SLOPE_LINE_STARTED";
  }

  function isCurveStartedMode() {
    return editMode.value === "CURVE_STARTED";
  }

  function isSqrtStartedMode() {
    return editMode.value === "SQRT_STARTED";
  }

  function isVerticalLineStartedMode() {
    return editMode.value === "VERTICAL_LINE_STARTED";
  }

  function isVerticalLineDrawingMode() {
    return editMode.value === "VERTICAL_LINE_DRAWING";
  }

  function isSlopeLineDrawingMode() {
    return (
      editMode.value === "SLOPE_LINE_DRAWING" ||
      editMode.value === "POLYGON_DRAWING"
    );
  }

  function isSlopeLineEditingMode() {
    return (
      editMode.value === "SLOPE_LINE_EDITING_LEFT" ||
      editMode.value === "SLOPE_LINE_EDITING_RIGHT"
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

  function isHorizontalLineSelectedMode() {
    return editMode.value === "HORIZONTAL_LINE_SELECTED";
  }

  function isVerticalLineSelectedMode() {
    return editMode.value === "VERTICAL_LINE_SELECTED";
  }

  function isSlopeLineSelectedMode() {
    return editMode.value === "SLOPE_LINE_SELECTED";
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

      case "ANNOTATION_STARTED":
        return setEditMode("ANNOTATION_WRITING");

      case "EXPONENT_STARTED":
        return setEditMode("EXPONENT_WRITING");

      case "HORIZONTAL_LINE_STARTED":
        return setEditMode("HORIZONTAL_LINE_DRAWING");

      case "VERTICAL_LINE_STARTED":
        return setEditMode("VERTICAL_LINE_DRAWING");

      case "POLYGON_STARTED":
        return setEditMode("POLYGON_DRAWING");

      case "SLOPE_LINE_STARTED":
        return setEditMode("SLOPE_LINE_DRAWING");

      case "CURVE_STARTED":
        return setEditMode("CURVE_DRAWING");
      case "CURVE_SELECTED":
        return setEditMode("CURVE_DRAWING");

      case "CIRCLE_STARTED":
        return setEditMode("CIRCLE_DRAWING");
      case "CIRCLE_SELECTED":
        return setEditMode("CIRCLE_DRAWING");

      case "SQRT_STARTED":
        return setEditMode("SQRT_DRAWING");
      case "SQRT_SELECTED":
        return setEditMode("SQRT_EDITING");

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
    isHorizontalLineMode,
    isHorizontalLineSelectedMode,
    isSqrtStartedMode,
    isHorizontalLineStartedMode,
    isHorizontalLineDrawingMode,
    isHorizontalLineEditingMode,
    isSqrtDrawingMode,
    isVerticalLineMode,
    isVerticalLineSelectedMode,
    isVerticalLineStartedMode,
    isVerticalLineDrawingMode,
    isVerticalLineEditingMode,
    isSlopeLineMode,
    isSlopeLineSelectedMode,
    isCurveSelectedMode,
    isSlopeLineStartedMode,
    isCurveStartedMode,
    isSlopeLineDrawingMode,
    isSlopeLineEditingMode,
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
    isCurveEditingControlPointMode,
    setEditMode,
    setNextEditMode,
    setDefaultEditMode,
  };
});
