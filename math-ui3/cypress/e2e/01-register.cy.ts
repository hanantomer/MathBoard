import type {} from "cypress";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.clearCookies();
    cy.visit("http://localhost:13035");
    cy.get('[data-cy="signup_btn"] > .v-btn__content').click();
    cy.get('[data-cy="register_fname"]').type("hanan");
    cy.get('[data-cy="register_lname"]').type("tomer");
    cy.get('[data-cy="register_email"]').type("hanantomer@gmail.com");
    cy.get('[data-cy="register_password"]').type("12345678");
    cy.get('[data-cy="register_verify"]').type("12345678");
    cy.get('input[type="checkbox"]').click();
    cy.get('[data-cy="register_signup"]').should("be.enabled");
    cy.get('[data-cy="register_signup"] > span.v-btn__content').click();
  });
});
