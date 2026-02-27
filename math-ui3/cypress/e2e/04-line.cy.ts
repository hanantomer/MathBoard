import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");
    cy.openLesson();
    cy.clearBoard();
    cy.drawLine("lineButton", "lineRightHandle", 300, 300, 200, 400);
    cy.dataCy("line").invoke("outerWidth").should("be.gt", 99);
    cy.dataCy("line").invoke("outerWidth").should("be.lt", 250);
  });
});
