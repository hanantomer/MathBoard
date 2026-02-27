import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e - circle draw and resize", () => {
    cy.visit("http://localhost:13035");
    cy.openLesson();
    cy.clearBoard();

    // draw circle
    cy.drawLine("circleButton", "circleRightHandle", 300, 300, 400, 300);

    it("should verify the circle radius", () => {
      cy.get('[data-cy="circle"]').then(($el) => {
        // Cast the first element in the jQuery collection to SVGCircleElement
        const circle = $el[0] as unknown as SVGCircleElement;

        const radius = circle.r.baseVal.value;

        // Perform assertions
        expect(radius).to.be.greaterThan(50);
      });
    });
  });
});
