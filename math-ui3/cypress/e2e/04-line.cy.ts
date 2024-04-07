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

    cy.drawLine(200, 200, 100);

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

    cy.get(".line").invoke("outerWidth").should("be.gt", 200);
    cy.get(".line").invoke("outerWidth").should("be.lt", 350);
  });
});
