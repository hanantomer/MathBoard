import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e - circle draw and resize", () => {
    cy.visit("http://localhost:13035");
    cy.login();
    cy.openLesson();
    cy.clearBoard();

    // draw circle
    cy.drawLine("circleButton", 300, 300, 400, 300, "circle");

    cy.dataCy("circle").then(($el) => {
      const circle = $el[0] as unknown as {
        r: { baseVal: { value: number } };
      };
      const radius = circle.r.baseVal.value;
      expect(radius).to.be.greaterThan(50);
    });

    // Circle stays selected. Alt+X must still arm exponent (not only CELL_SELECTED).
    cy.dataCy("circleButton").should("have.class", "toolbar-mode-btn--active");
    cy.window().then((win) => {
      const opts: KeyboardEventInit = {
        key: "x",
        code: "KeyX",
        altKey: true,
        bubbles: true,
        cancelable: true,
      };
      win.dispatchEvent(new win.KeyboardEvent("keydown", opts));
      win.dispatchEvent(new win.KeyboardEvent("keyup", opts));
    });
    cy.dataCy("exponentButton").should("have.class", "toolbar-mode-btn--active");
    cy.dataCy("instruction-bar").should(
      "contain",
      "Click on a cell to create an exponent",
    );
  });
});
