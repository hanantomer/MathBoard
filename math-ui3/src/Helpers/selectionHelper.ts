import { NotationTypeEditMode } from "common/unions";
import {
  LineNotationAttributes,
  RectNotationAttributes,
} from "common/baseTypes";
import { useNotationStore } from "../store/pinia/notationStore";
import {
  selectedCellColor,
  CellCoordinates,
  DotPosition,
} from "common/globals";
import { NotationAttributes } from "common/baseTypes";
import useElementFinderHelper from "./elementFinderHelper";
import useNotationMutateHelper from "./notationMutateHelper";
import useUserOutgoingOperationsHelper from "./userOutgoingOperationsHelper";
import useEventBus from "./eventBusHelper";
import { useLessonStore } from "../store/pinia/lessonStore";
import { useEditModeStore } from "../store/pinia/editModeStore";
const eventBus = useEventBus();
const notationStore = useNotationStore();
const notationMutateHelper = useNotationMutateHelper();
const elementFinderHelper = useElementFinderHelper();
const userOutgoingOperationsHelper = useUserOutgoingOperationsHelper();
const lessonStore = useLessonStore();
const editModeStore = useEditModeStore();

///TODO : split function to shorter blocks
export default function selectionHelper() {
  // called via mouse click
  function selectClickedNotation(position: DotPosition) {
    notationStore.resetSelectedNotations();

    if (
      selectRectNotation(position) ||
      selectFractionNotation(position) ||
      selectSqrtNotation(position)
    ) {
      notationStore.selectCell(null);
      return;
    }

    selectSymbolNotation(position);
  }

  function selectNotation(activeNotation: NotationAttributes) {
    // disallow selection of question notations for student
    if (notationMutateHelper.isNotationInQuestionArea(activeNotation)) return;

    editModeStore.setEditMode("AREA_SELECTED");
    notationStore.selectNotation(activeNotation?.uuid);
  }

  function getOverlappedRectNotation(
    position: DotPosition,
  ): RectNotationAttributes | null | undefined {
    let rectElement = elementFinderHelper.findRectAtClickedPosition(position);
    if (!rectElement) return null;

    const rectNotation: RectNotationAttributes | undefined = notationStore
      .getNotationsByShape<RectNotationAttributes>("RECT")
      .find((n: RectNotationAttributes) => {
        return (
          elementFinderHelper.getElementAttributeValue(
            rectElement,
            "fromCol",
          ) ||
          (-1 == n.fromCol &&
            elementFinderHelper.getElementAttributeValue(
              rectElement,
              "toCol",
            )) ||
          (-1 == n.toCol &&
            elementFinderHelper.getElementAttributeValue(
              rectElement,
              "fromRow",
            )) ||
          (-1 == n.fromRow &&
            elementFinderHelper.getElementAttributeValue(
              rectElement,
              "toRow",
            )) ||
          -1 == n.toRow
        );
      });

    return rectNotation;
  }

  // called by store watcher. see mathboard.vue
  /// TODO - move to dom helper or matrix helper
  function showSelectedCell(
    svgId: string,
    newSelectedCell: CellCoordinates | null | undefined,
    oldSelectedCell: CellCoordinates | null | undefined,
  ) {
    if (oldSelectedCell?.col != null) {
      let prevRectElm = document
        ?.querySelector<HTMLElement>(
          `svg[id="${svgId}"] g[row="${oldSelectedCell.row}"]`,
        )
        ?.querySelector<HTMLElement>(`rect[col="${oldSelectedCell.col}"]`);

      if (prevRectElm?.style) prevRectElm.style.fill = "";
    }

    if (newSelectedCell?.col != null) {
      let rectElm = document
        ?.querySelector<HTMLElement>(
          `svg[id="${svgId}"] g[row="${newSelectedCell.row}"]`,
        )
        ?.querySelector<HTMLElement>(`rect[col="${newSelectedCell.col}"]`);

      if (rectElm?.style) rectElm.style.fill = selectedCellColor;
    }
  }

  function getOverlappedLineNotation(
    lineElement: Element,
  ): NotationAttributes | undefined {
    const lineNotations =
      notationStore.getNotationsByShape<LineNotationAttributes>("LINE");

    return lineNotations.find((n: LineNotationAttributes) => {
      return (
        elementFinderHelper.getElementAttributeValue(lineElement, "fromCol") ||
        (-1 >= n.fromCol &&
          elementFinderHelper.getElementAttributeValue(lineElement, "toCol")) ||
        (-1 <= n.toCol &&
          elementFinderHelper.getElementAttributeValue(lineElement, "row")) ||
        -1 == n.row
      );
    });
  }

  function selectRectNotation(position: DotPosition): boolean {
    const rectElement = elementFinderHelper.findClickedObject(
      {
        x: position.x,
        y: position.y,
      },
      "foreignObject",
      ["TEXT", "IMAGE", "GEO"],
    );
    if (!rectElement) return false;

    let overlapRectNotation = getOverlappedRectNotation(position);
    if (!overlapRectNotation) return false;

    selectNotation(overlapRectNotation);

    return true;
  }

  function selectFractionNotation(position: DotPosition): boolean {
    const fractionElement = elementFinderHelper.findClickedObject(
      {
        x: position.x,
        y: position.y,
      },
      "foreignObject",
      ["FRACTION"],
    );
    if (!fractionElement) return false;

    const fractionUUId = elementFinderHelper.getElementAttributeValue(
      fractionElement,
      "id",
    );

    editModeStore.setEditMode("FRACTION_SELECTED");

    // signal LineDrawer.vue to perform store and visual selection
    eventBus.emit("lineSelected", notationStore.getNotation(fractionUUId!));

    return true;
  }

  function selectSqrtNotation(position: DotPosition): boolean {
    const sqrtElement = elementFinderHelper.findClickedObject(
      {
        x: position.x,
        y: position.y,
      },
      "foreignObject",
      ["SQRT"],
    );
    if (!sqrtElement) return false;

    const sqrtUUId = elementFinderHelper.getElementAttributeValue(
      sqrtElement,
      "id",
    );

    editModeStore.setEditMode("SQRT_SELECTED");

    // signal LineDrawer.vue to perform store and visual selection
    eventBus.emit("lineSelected", notationStore.getNotation(sqrtUUId!));

    return true;
  }

  function selectSymbolNotation(position: DotPosition): boolean {
    const symbolElement = elementFinderHelper.findClickedObject(
      {
        x: position.x,
        y: position.y,
      },
      "foreignObject",
      ["SYMBOL"],
    );
    if (!symbolElement) return false;

    const uuid = symbolElement.attributes.getNamedItem("id")?.value;
    const symbolNotation = notationStore.getNotation(uuid!);

    selectNotation(symbolNotation!);

    return true;
  }

  // update, store active cell
  async function selectCell(position: DotPosition) {
    let clickedCell = elementFinderHelper.findClickedObject(
      position,
      "rect",
      null,
    );

    if (!clickedCell?.parentElement) {
      return null;
    }

    const col = elementFinderHelper.getElementAttributeValue(
      clickedCell,
      "col",
    );
    const row = elementFinderHelper.getElementAttributeValue(
      clickedCell.parentElement,
      "row",
    );

    let cellToActivate: CellCoordinates = {
      col: parseInt(col || "-1"),
      row: parseInt(row || "-1"),
    };

    notationStore.selectCell(cellToActivate);
    editModeStore.setEditMode("CELL_SELECTED");

    if (notationStore.getParent().type == "LESSON") {
      let t = await userOutgoingOperationsHelper.syncOutgoingSelectedCell(
        cellToActivate,
        lessonStore.getCurrentLesson().uuid,
      );
    }
  }

  return {
    showSelectedCell,
    selectCell,
    selectClickedNotation,
  };
}
