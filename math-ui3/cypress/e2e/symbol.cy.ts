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
    cy.get('foreignObject[row="1"][col="1"] > p').should("include.text", "3");
  });
});
