import type {} from "cypress";
import { ChildProcess } from "child_process";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:3000");
    cy.get(".mdi-account").click();
    cy.get('[data-cy="register"] > .v-btn__content').click();
  });
});
