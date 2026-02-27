import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e - annotation draw and move", () => {
    cy.visit("http://localhost:13035");
    cy.openLesson();
    cy.clearBoard();

    // draw annotation
    cy.dataCy("annotationButton").click();
    cy.get("#lessonSvg").trigger("mousedown", { x: 300, y: 300 });
    cy.get("#lessonSvg").trigger("mouseup");

    // verify annotation editor exists
    cy.dataCy("annotationEditor").should("exist");

    // type annotation text
    cy.get("body").type("Note");
    cy.get("body").type("{enter}");

    cy.get("body").trigger("mousedown", { x: 600, 600: 400 }).trigger("mouseup");

   // cy.dataCy("annotation").should("exist");

  });
});
