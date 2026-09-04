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
  });
});
