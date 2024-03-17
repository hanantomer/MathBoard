import type {} from "cypress";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");
    cy.get(".mdi-account").click({ multiple: true });
    cy.get('[data-cy="register"] > .v-btn__content').click();
    cy.get('[data-cy="register_fname"]').type("hanan");
    cy.get('[data-cy="register_lname"]').type("tomer");
    cy.get('[data-cy="register_email"]').type("hanantomer@gmail.com");
    cy.get('[data-cy="register_password"]').type("12345678");
    cy.get('[data-cy="register_verify"]').type("12345678");
    cy.get('input[type="checkbox"]').click();
    cy.get('[data-cy="register_signup"] > .v-btn__content').click();
    cy.get('[data-cy="login_email"]').type("hanantomer@gmail.com");
    cy.get('[data-cy="login_password"]').type("12345678");
    cy.get('[data-cy="login"] > .v-btn__content').click();
    cy.get('[data-cy="lessons"] > .v-btn__content').click();
    cy.get(".mdi-plus").click();
    cy.focused().type("test lesson");
    cy.get('[data-cy="button-save"] > .v-btn__content').click();
  });
});
