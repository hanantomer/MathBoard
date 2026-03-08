import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");
    cy.openLesson();
    cy.clearBoard();

    cy.get("#lessonSvg")
      .trigger("mousedown", {
        buttons: 0,
        x: 350,
        y: 500,
        force: true,
      })
      .trigger("mouseup");

    cy.dataCy("sqrtButton").click();

    //    cy.dataCy("sqrtDrawer").should("exist");

    //    cy.dataCy("sqrtDrawer").click();

    cy.dataCy("sqrtRightHandle").trigger("mousedown", {
      buttons: 1,
      force: true,
    });

    cy.get("#lessonSvg")
      .trigger("mousemove", {
        buttons: 1,
        x: 861,
        y: 500,
      })
      .trigger("mousemove", {
        buttons: 1,
        x: 862,
        y: 500,
      })
      .trigger("mousemove", {
        buttons: 1,
        x: 992,
        y: 500,
      })
      .trigger("mouseup");

    cy.get('[row="1"] > [col="1"]').click();
    cy.get('[row="1"] > [col="1"]').click();

    cy.get(".sqrt").invoke("outerWidth").should("be.gt", 150);
  });
});
