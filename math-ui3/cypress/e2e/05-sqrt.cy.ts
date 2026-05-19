import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");
    cy.login();
    cy.openLesson();
    cy.clearBoard();

    cy.clickSvg(350, 500);

    cy.dataCy("sqrtButton").click();

    cy.dragLineRightHandle("sqrtRightHandle", 992, 500);

    cy.get('[row="1"] > [col="1"]').click({ force: true });
    cy.get('[row="1"] > [col="1"]').click({ force: true });

    cy.get(".sqrt").invoke("outerWidth").should("be.gt", 150);
  });
});
