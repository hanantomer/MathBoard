import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");
    cy.openLesson();
    cy.clearBoard();

    cy.get('[row="0"] > [col="0"]').click();

    // type some text
    cy.get("body").type("3");
    cy.get('foreignObject[row="0"][col="0"] > p').should("include.text", "3");

    cy.get("body").type("4");
    cy.get('foreignObject[row="0"][col="1"] > p').should("include.text", "4");

    cy.get('foreignObject[row="0"][col="0"] > p').click();
    cy.get("body").type("{del}");
    cy.get('[row="0"] > [col="0"]').should("not.include.text", "3");


  });
});
