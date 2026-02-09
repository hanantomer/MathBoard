import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";
import { should } from "chai";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");
    cy.openLesson();
    cy.dataCy("linedrawer").click();

    const x = 100;
    const y = 200;
    const width = 300;

    cy.get("#lessonSvg").trigger("mousedown", { x: x, y: y });

    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: x + 1,
      y: y,
    });

    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: x + 2,
      y: 200,
    });

    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: +width,
      y: 200,
      force: true,
    });

    cy.get("#lessonSvg").trigger("mouseup");
    cy.dataCy("lineRightHandle").trigger("mousedown");
    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 301,
      y: 200,
    });
    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 302,
      y: 200,
    });
    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 400,
      y: 200,
    });

    cy.dataCy("lineRightHandle").trigger("mouseup");

    //    cy.dataCy("line").invoke("outerWidth").should("be.gt", 200);
    //    cy.dataCy("line").invoke("outerWidth").should("be.lt", 350);
  });
});
