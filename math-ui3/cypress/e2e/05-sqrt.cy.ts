import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");
    cy.openLesson();
//    cy.clearBoard();

    cy.dataCy("sqrt").click();

    cy.get("#lessonSvg").realMouseDown({ x: 500, y: 500 });

    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 501,
      y: 500,
      force: true,
    });
    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 502,
      y: 500,
      force: true,
    });
    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 600,
      y: 500,
      force: true,
    });
    cy.get("#lineRightHandle").trigger("mouseup");

    cy.get(".line").invoke("outerWidth").should("be.gt", 50);
  });
});
