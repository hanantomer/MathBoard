import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");
    cy.openLesson();
    cy.clearBoard();

    cy.get('[row="2"] > [col="2"]').click();
    // type some text
    cy.get("body").type("3");
    cy.get('foreignObject[row="2"][col="2"] > div > p').should(
      "include.text",
      "3",
    );

    cy.dataCy("exponentButton").click();

    cy.get("body").type("4").type("{enter}");
    cy.get('foreignObject[row="2"][col="3"] > div > p').should(
      "include.text",
      "4",
    );
    // verify exponent is rendered correctly
    cy.get('foreignObject[row="2"][col="3"] > div > p').should(
      "have.css",
      "font-size",
      "8.8px",
    );

    cy.get('[row="2"] > [col="4"]').click();
    cy.dataCy("logButton").click();
    cy.get('foreignObject[row="2"][col="4"] > div > p').should(
      "include.text",
      "log",
    );
  });
});
