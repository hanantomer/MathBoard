import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e - free sketch annotation draw", () => {
    cy.visit("http://localhost:13035");
    cy.openLesson();
    cy.clearBoard();

    // draw free skecth
    //cy.dataCy("freesketchButton").click();
    //cy.get("#lessonSvg").trigger("mousedown", { x: 300, y: 300 });
    //cy.get("#lessonSvg").trigger("mouseup");

    // verify free sketch editor exists
    //cy.dataCy("freeSketchEditor").should("exist");

    cy.drawLine("freesketchButton", null, 300, 300, 200, 400);
  });
});
