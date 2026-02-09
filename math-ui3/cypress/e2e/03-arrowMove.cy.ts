import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");
    cy.openLesson();
//    cy.clearBoard();

    cy.get('[row="0"] > [col="0"]').click();

    cy.get("body").type("{rightarrow}");
    cy.get('[row="0"] > [col="1"]')
      .should("have.css", "stroke")
      .and("include", "rgb(255, 0, 0)"); // verify new cell is selected

    // move down with arrow
    cy.get("body").type("{downarrow}");
    cy.get('[row="1"] > [col="1"]')
      .should("have.css", "stroke")
      .and("include", "rgb(255, 0, 0)"); // verify new cell is selected

  });
});
