import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e - annotation draw and move", () => {
    cy.visit("http://localhost:13035");
    cy.login();
    cy.openLesson();
    cy.clearBoard();

    // draw annotation
    cy.dataCy("annotationButton").click();
    cy.dismissUiOverlays();
    cy.clickSvg(300, 300);

    // verify annotation editor exists
    cy.dataCy("annotationEditor").should("exist");

    // type annotation text
    cy.get("body").type("Note");
    cy.get("body").type("{enter}");

    cy.clickSvg(600, 400);

   // cy.dataCy("annotation").should("exist");

  });
});
