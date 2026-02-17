import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");
    cy.openLesson();
    cy.clearBoard();

    cy.get("#lessonSvg").trigger("mousedown", {
      buttons: 0,
      x: 380,
      y: 500,
      force: true,
    });

    cy.get("#lessonSvg").trigger("mouseup");

    cy.dataCy("sqrtButton").click();

    cy.get(".sqrt").should("exist");

    cy.get(".sqrt").trigger("mousedown").trigger("mouseup");

    cy.dataCy("sqrtRightHandle").trigger("mousedown");

    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 551,
      y: 500,
      force: true,
    });
    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 552,
      y: 500,
      force: true,
    });
    cy.get("#lessonSvg")
      .trigger("mousemove", {
        buttons: 1,
        x: 600,
        y: 500,
        force: true,
      })
      .trigger("mouseup");

    cy.get(".sqrt").invoke("outerWidth").should("be.gt", 50);
  });
});
