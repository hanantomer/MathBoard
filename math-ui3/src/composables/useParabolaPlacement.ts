import { computed, ref } from "vue";
import type { DotCoordinates } from "common/baseTypes";

/** Shared while the parabola tool is collecting through-points. */
const placingActive = ref(false);
const placingPoints = ref<DotCoordinates[]>([]);
const hoverPoint = ref<DotCoordinates | null>(null);

export function useParabolaPlacement() {
  const count = computed(() => placingPoints.value.length);

  const stepLabel = computed(() => `Parabola (${count.value}/3)`);

  const hint = computed(() => {
    switch (count.value) {
      case 0:
        return "Click 3 points the curve must pass through (intercepts work well). You can undo after each click.";
      case 1:
        return "Point 1 set. Click point 2 of 3, or Undo last point.";
      default:
        return "Point 2 set. Click point 3 of 3. Preview follows the pointer. Undo last point to go back.";
    }
  });

  function setActive(on: boolean) {
    placingActive.value = on;
    if (!on) {
      placingPoints.value = [];
      hoverPoint.value = null;
    }
  }

  function setPoints(points: DotCoordinates[]) {
    placingPoints.value = points;
  }

  function undoLast(): boolean {
    if (!placingActive.value || placingPoints.value.length === 0) return false;
    placingPoints.value = placingPoints.value.slice(0, -1);
    hoverPoint.value = null;
    return true;
  }

  /** Drop this point and every point after it, so that slot can be clicked again. */
  function undoFrom(index: number): boolean {
    if (!placingActive.value) return false;
    if (index < 0 || index >= placingPoints.value.length) return false;
    placingPoints.value = placingPoints.value.slice(0, index);
    hoverPoint.value = null;
    return true;
  }

  return {
    placingActive,
    placingPoints,
    hoverPoint,
    count,
    stepLabel,
    hint,
    setActive,
    setPoints,
    undoLast,
    undoFrom,
  };
}
