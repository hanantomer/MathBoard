import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

const TEXT_HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;

/** Cream-strip / column-beneath bugs were 8–20px; subpixel + 2px groove stays under this. */
const ALIGN_PX = 4;

function rectOf(el: HTMLElement) {
  return el.getBoundingClientRect();
}

function assertRectsAlign(
  actual: DOMRect,
  expected: DOMRect,
  label: string,
  maxDelta = ALIGN_PX,
) {
  expect(actual.left, `${label} left`).to.be.closeTo(expected.left, maxDelta);
  expect(actual.top, `${label} top`).to.be.closeTo(expected.top, maxDelta);
  expect(actual.width, `${label} width`).to.be.closeTo(expected.width, maxDelta);
  expect(actual.height, `${label} height`).to.be.closeTo(
    expected.height,
    maxDelta,
  );
}

function expectedHandleCenters(box: DOMRect) {
  return {
    nw: { x: box.left, y: box.top },
    n: { x: box.left + box.width / 2, y: box.top },
    ne: { x: box.right, y: box.top },
    e: { x: box.right, y: box.top + box.height / 2 },
    se: { x: box.right, y: box.bottom },
    s: { x: box.left + box.width / 2, y: box.bottom },
    sw: { x: box.left, y: box.bottom },
    w: { x: box.left, y: box.top + box.height / 2 },
  };
}

function assertVisibleHandlesOn(selector: string) {
  cy.get(selector)
    .should("be.visible")
    .then(($box) => {
      const box = rectOf($box[0] as HTMLElement);
      const expected = expectedHandleCenters(box);
      TEXT_HANDLES.forEach((handle) => {
        cy.get(`[data-cy="textResize-${handle}"]:visible`)
          .should("have.length", 1)
          .then(($h) => {
            const r = rectOf($h[0] as HTMLElement);
            const pt = expected[handle];
            expect(r.left + r.width / 2, `${handle} x`).to.be.closeTo(
              pt.x,
              ALIGN_PX,
            );
            expect(r.top + r.height / 2, `${handle} y`).to.be.closeTo(
              pt.y,
              ALIGN_PX,
            );
          });
      });
    });
}

/** Fail if the TEXT FO or selection chrome covers a point outside the beige box. */
function assertPointMissesTextUi(clientX: number, clientY: number, label: string) {
  cy.document().then((doc) => {
    const el = doc.elementFromPoint(clientX, clientY) as HTMLElement | null;
    expect(el, `${label}: element under point`).to.exist;
    expect(
      el!.closest('foreignObject[notationType="TEXT"]'),
      `${label}: TEXT foreignObject`,
    ).to.equal(null);
    expect(
      el!.closest('[data-cy="area-selection"]'),
      `${label}: selection overlay`,
    ).to.equal(null);
    expect(
      el!.closest(".text-resize-handle"),
      `${label}: resize handle`,
    ).to.equal(null);
  });
}

describe("e2e", () => {
  before(function () {});
  it("e2e - text draw, select alignment, and resize", () => {
    cy.visit("http://localhost:13035");
    cy.login();
    cy.openLesson();
    cy.clearBoard();
    cy.dataCy("freetextButton").click();
    cy.dismissUiOverlays();

    cy.selectArea(300, 200, 100, 100);

    cy.dataCy("freeTextEditor").should("be.visible").type("Hello World");
    cy.dataCy("freeTextEditor")
      .invoke("val")
      .then((value) => {
        expect(value).to.equal("Hello World");
      });

    assertVisibleHandlesOn('[data-cy="freeTextEditorRoot"]');

    cy.clickSvg(50, 50);

    cy.dataCy("board-text")
      .should("be.visible")
      .invoke("val")
      .should("eq", "Hello World");

    cy.dataCy("board-text").then(($text) => {
      const painted = rectOf($text[0] as HTMLElement);
      const midX = painted.left + painted.width / 2;
      assertPointMissesTextUi(midX, painted.bottom + 20, "below committed text");
      assertPointMissesTextUi(midX, painted.top - 12, "above committed text");
    });

    // Clicking below the painted box must not select it (column-beneath hit-test).
    cy.clickSvgAtElement('[data-cy="board-text"]', { dy: 1, extraY: 28 });
    cy.get('[data-cy="textResize-se"]:visible').should("not.exist");
    cy.get('[data-cy="area-selection"].selection--text').should("not.exist");

    cy.clickSvgAtElement('[data-cy="board-text"]');

    cy.dataCy("area-selection").should("be.visible");
    cy.get('[data-cy="textResize-se"]:visible').should("be.visible");

    cy.dataCy("area-selection")
      .should("have.css", "padding-top", "0px")
      .and("have.css", "padding-bottom", "0px")
      .and("have.css", "padding-left", "0px")
      .and("have.css", "padding-right", "0px");

    cy.dataCy("board-text").then(($text) => {
      const painted = rectOf($text[0] as HTMLElement);
      cy.dataCy("area-selection").then(($overlay) => {
        assertRectsAlign(
          rectOf($overlay[0] as HTMLElement),
          painted,
          "selection overlay vs painted text",
        );
      });
    });

    assertVisibleHandlesOn('[data-cy="board-text"]');

    cy.dataCy("board-text").then(($text) => {
      const painted = rectOf($text[0] as HTMLElement);
      const midX = painted.left + painted.width / 2;
      assertPointMissesTextUi(midX, painted.bottom + 20, "below selected text");
      assertPointMissesTextUi(midX, painted.top - 12, "above selected text");
    });

    cy.dataCy("board-text").then(($text) => {
      const painted = rectOf($text[0] as HTMLElement);
      cy.clickSvgAtElement('[data-cy="board-text"]');
      cy.dataCy("freeTextEditor").should("be.visible");
      cy.dataCy("freeTextEditorRoot").then(($editor) => {
        assertRectsAlign(
          rectOf($editor[0] as HTMLElement),
          painted,
          "editor vs painted text",
        );
      });
    });

    cy.clickSvg(50, 50);
    cy.dataCy("board-text").should("be.visible");

    cy.clickSvgAtElement('[data-cy="board-text"]');
    cy.get('[data-cy="textResize-se"]:visible').should("be.visible");

    cy.dataCy("board-text").then(($text) => {
      const before = rectOf($text[0] as HTMLElement);
      cy.dragViewportHandle("textResize-se", 90, 70);

      cy.dataCy("board-text").should(($after) => {
        const after = rectOf($after[0] as HTMLElement);
        expect(after.width, "resized width").to.be.greaterThan(before.width + 16);
        expect(after.height, "resized height").to.be.greaterThan(
          before.height + 16,
        );
      });
    });

    // Mouseup must end the drag: a later move must not keep growing the box.
    cy.dataCy("area-selection").then(($overlay) => {
      const afterResize = rectOf($overlay[0] as HTMLElement);
      cy.window().then((win) => {
        const event = new win.PointerEvent("pointermove", {
          bubbles: true,
          cancelable: true,
          composed: true,
          pointerId: 1,
          pointerType: "mouse",
          isPrimary: true,
          clientX: afterResize.right + 120,
          clientY: afterResize.bottom + 120,
          button: 0,
          buttons: 1,
        });
        win.dispatchEvent(event);
      });
      cy.dataCy("area-selection").then(($still) => {
        assertRectsAlign(
          rectOf($still[0] as HTMLElement),
          afterResize,
          "overlay after stray pointermove",
        );
      });
    });

    assertVisibleHandlesOn('[data-cy="board-text"]');
  });
});
