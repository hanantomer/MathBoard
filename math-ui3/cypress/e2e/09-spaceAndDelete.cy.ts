import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");
    cy.openLesson();
    cy.clearBoard();

    cy.get('[row="10"] > [col="10"]').click();

    cy.get("body").type("3");
    cy.get('foreignObject[row="10"][col="10"] > div > p').should(
      "include.text",
      "3",
    );

    cy.get('[row="10"] > [col="9"]').click();
    cy.get("body").type(" ");
    // verify text moved to the right
    cy.get('foreignObject[row="10"][col="11"] > div > p').should(
      "include.text",
      "3",
    );

    cy.get('[row="10"] > [col="9"]').click();
    cy.get("body").type("{del}");
    // verify text moved to the left
    cy.get('foreignObject[row="10"][col="10"] > div > p').should(
      "include.text",
      "3",
    );
  });
});
