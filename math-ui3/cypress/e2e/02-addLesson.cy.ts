import type {} from "cypress";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");
    cy.get(".mdi-account").click({ multiple: true });
    cy.login();
    cy.get('[data-cy="lessons"] > .v-btn__content').click();
    //cy.get(".mdi-plus").click();
    cy.get('[data-cy="newItemName"] input')
      .should("be.visible")
      .type("test lesson");

    cy.get('[data-cy="button-save"] > .v-btn__content').click();
  });
});
