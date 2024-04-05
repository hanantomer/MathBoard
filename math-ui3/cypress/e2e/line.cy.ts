import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";
import { should } from "chai";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");
    cy.openLesson();
    cy.clearBoard();

    cy.dataCy("fraction").click();

    cy.get("#lessonSvg").realMouseDown({ x: 200, y: 200 });

    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 201,
      y: 200,
      force: true,
    });
    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 202,
      y: 200,
      force: true,
    });
    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 300,
      y: 200,
      force: true,
    });
    cy.get("#lineRightHandle").trigger("mouseup");

    cy.get(".line").invoke("outerWidth").should("be.gt", 50);
    cy.get(".line").invoke("outerWidth").should("be.lt", 150);

    //edit line
    cy.get("foreignObject[notationType='FRACTION'] span.line").click();

    cy.get("#lineRightHandle").realMouseDown();
    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 301,
      y: 200,
      force: true,
    });
    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 302,
      y: 200,
      force: true,
    });
    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 400,
      y: 200,
      force: true,
    });

    cy.get("#lineRightHandle").trigger("mouseup");

    // cy.get(".line").invoke("outerWidth").should("be.gt", 100);
    // cy.get(".line").invoke("outerWidth").should("be.lt", 300);
  });
});
