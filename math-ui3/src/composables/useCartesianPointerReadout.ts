import { onMounted, onUnmounted, ref } from "vue";
import { useCellStore } from "../store/pinia/cellStore";
import { useNotationStore } from "../store/pinia/notationStore";
import { cartesianMathReadout } from "../helpers/cartesianMathHelper";
import { clientPointToSvgUser } from "../helpers/pointerCoordinateHelper";

/** Live math (x, y) while the pointer is over the board and axes exist. */
export function useCartesianPointerReadout() {
  const cellStore = useCellStore();
  const notationStore = useNotationStore();
  const mathCoords = ref("");

  function clear() {
    if (mathCoords.value) mathCoords.value = "";
  }

  function onPointerMove(e: PointerEvent) {
    const svgId = cellStore.getSvgId();
    if (!svgId) {
      clear();
      return;
    }
    const svg = document.getElementById(svgId);
    if (!(svg instanceof SVGSVGElement)) {
      clear();
      return;
    }
    const r = svg.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    ) {
      clear();
      return;
    }
    const user = clientPointToSvgUser(e.clientX, e.clientY);
    mathCoords.value = cartesianMathReadout(
      user,
      notationStore.getNotations(),
      cellStore.getCellHorizontalWidth(),
      cellStore.getCellVerticalHeight(),
    );
  }

  onMounted(() => {
    document.addEventListener("pointermove", onPointerMove, { passive: true });
  });
  onUnmounted(() => {
    document.removeEventListener("pointermove", onPointerMove);
  });

  return { mathCoords };
}
