import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("inserts sqrt at the selected cell with no vinculum", () => {
    cy.visit("http://localhost:13035");
    cy.login();
    cy.openLesson();
    cy.clearBoard();

    cy.get('[row="0"] > [col="0"]').click({ force: true });
    cy.dataCy("sqrtButton").click();

    cy.get(".sqrtsymbol").should("exist");
    cy.get(".sqrt:visible").should("not.exist");
  });

  it("wraps selected symbols with a vinculum", () => {
    cy.visit("http://localhost:13035");
    cy.login();
    cy.openLesson();
    cy.clearBoard();

    cy.get('[row="0"] > [col="1"]').click({ force: true });
    cy.get("body").type("25");

    cy.dataCy("selectionButton").click();
    cy.selectArea(10, 10, 80, 50);
    cy.dataCy("sqrtButton").click();

    cy.get(".sqrtsymbol").should("exist");
    cy.get(".sqrt:visible").invoke("outerWidth").should("be.gt", 20);
  });
});
