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
    cy.dataCy("polylineButton").click();

    cy.drawPolyline([
      [500, 500],
      [600, 600],
      [400, 650],
      [500, 500],
    ]);

    cy.get(".line").should("have.length.gt", 4); // 4 includes the hidden line editor
  });
});
