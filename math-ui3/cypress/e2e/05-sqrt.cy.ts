import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");
    cy.login();
    cy.openLesson();
    cy.clearBoard();
    cy.drawLine("sqrtButton", 350, 500, 992, 500, "sqrtRightHandle");
    cy.get(".sqrt").invoke("outerWidth").should("be.gt", 150);
  });
});
