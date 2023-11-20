import { NotationType, NotationTypeValues } from "common/unions";
import { DotPosition, CellCoordinates } from "common/globals";

export default function elementFinderHelper() {
  //https://stackoverflow.com/questions/22428484/get-element-from-point-when-you-have-overlapping-elements
  function findClickedObject(
    dotPosition: DotPosition,
    tagName: string,
    notationTypes: readonly NotationType[] | null,
  ): HTMLElement {
    var elements = [];
    var display: any = [];
    var item = document.elementFromPoint(dotPosition.x, dotPosition.y) as any; // must be any to accept window
    var prevItem = null;
    var idx = 0;

    while (
      idx++ < 50 &&
      item &&
      (!prevItem || item != prevItem) &&
      item != document.body &&
      item != window &&
      item != document &&
      item != document.documentElement
    ) {
      elements.push(item);
      display.push(item.style.display);
      item.style.display = "none";
      prevItem = item;
      item = document.elementFromPoint(dotPosition.x, dotPosition.y);
    }
    for (var i = 0; i < elements.length; i++) {
      elements[i].style.display = display[i];
    }
    return elements.find(
      (item) =>
        item.tagName == tagName &&
        (!notationTypes ||
          notationTypes?.includes(item.attributes.type?.value)),
    );
  }

  function findRectAtClickedPosition(e: MouseEvent): Element {
    return findClickedObject(
      {
        x: e.clientX,
        y: e.clientY,
      },
      "foreignObject",
      ["TEXT", "GEO", "IMAGE"],
    );
  }

  function findNotationAtClickedPosition(e: MouseEvent): Element {
    const el = findClickedObject(
      {
        x: e.clientX,
        y: e.clientY,
      },
      "foreignObject",
      NotationTypeValues,
    );

    return el;
  }

  function getElementAttributeValue(
    element: Element,
    attrName: string ,
  ): string | undefined{
    return element.attributes.getNamedItem(attrName)?.value;
  }

  return {
    findClickedObject,
    getElementAttributeValue,
    findRectAtClickedPosition,
    findNotationAtClickedPosition,
  };
}
