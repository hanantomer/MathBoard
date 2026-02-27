import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e - text draw and type", () => {
    cy.visit("http://localhost:13035");
    cy.openLesson();
    cy.clearBoard();
    cy.dataCy("freetextButton").click();

    cy.selectArea(300, 200, 100, 100);

    cy.dataCy("freeTextEditor").type("Hello World");


    cy.dataCy("freeTextEditor")
      .invoke("val")
      .then((value) => {
        expect(value).to.equal("Hello World");
      });

    // click outside to finish editing
    cy.get("#lessonSvg").click(0, 0);

    cy.get("textarea").invoke("val").then((value) => {
      expect(value).to.equal("Hello World");
    });

  });
});
