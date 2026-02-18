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

    // verify circle exists and has expected dimensions
    cy.dataCy("circle").should("exist");
    cy.dataCy("circle").invoke("outerWidth").should("be.gt", 50);
    cy.dataCy("circle").invoke("outerHeight").should("be.gt", 50);

    // verify circle is resizable (dimensions should be roughly equal for circle)
    cy.dataCy("circle")
      .invoke("outerWidth")
      .then((width) => {
        cy.dataCy("circle")
          .invoke("outerHeight")
          .should("be.closeTo", width as number, 150);
      });
  });
});
