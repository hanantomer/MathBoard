import { useNotationStore } from "../store/pinia/notationStore";
const notationStore = useNotationStore();

export default function () {
  function setNextEditMode() {
    const editMode = notationStore.getEditMode().value;

    switch (editMode) {
      case "FRACTION":
        return notationStore.setEditMode("FRACTION_DRAWING");
      case "SQRT":
        return notationStore.setEditMode("SQRT_DRAWING");
      case "FRACTION_SELECTED":
        return notationStore.setEditMode("FRACTION_DRAWING");
      case "SQRT_SELECTED":
        return notationStore.setEditMode("SQRT_DRAWING");
      case "FRACTION_SELECTING":
        return notationStore.setEditMode("FRACTION_SELECTED");
      case "SQRT_SELECTING":
        return notationStore.setEditMode("SQRT_SELECTED");
    }
  }

  return { setNextEditMode };
}
