import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");
    cy.openLesson();
    cy.clearBoard();
    cy.dataCy("polylineButton").click();

    cy.get("#lessonSvg")
      .trigger("mousedown", { x: 500, y: 500 })
      .trigger("mousemove", {
        buttons: 1,
        x: 600,
        y: 600,
      })
      .trigger("mouseup")
      .trigger("mousemove", {
        buttons: 1,
        x: 400,
        y: 650,
      })
      .trigger("mousemove", {
        buttons: 1,
        x: 400,
        y: 650,
      }).trigger("mouseup")
      .trigger("mousemove", {
        buttons: 1,
        x: 500,
        y: 500,
      })
      .trigger("mousemove", {
        buttons: 1,
        x: 500,
        y: 500,
      })
      .trigger("mouseup");

    cy.get(".line").should("have.length.gt", 4); // 4 includes the hidden line editor
  });
});
