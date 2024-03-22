import type {} from "cypress";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");

    cy.get('[data-cy="lessons"] > .v-btn__content').click();
    cy.login();
    // select cell
    cy.get('[row="0"] > [col="0"]')
      .click()
      .should("have.css", "stroke")
      .and("include", "rgb(255, 0, 0)");
    cy.get('[row="0"] > [col="1"]')
      .should("have.css", "stroke")
      .and("include", "rgb(211, 211, 211)");
    // move right with arrow
    cy.get("body").type("{rightarrow}");
    cy.get('[row="0"] > [col="1"]')
      .should("have.css", "stroke")
      .and("include", "rgb(255, 0, 0)"); // verify new cell is selected

    // type some text
    cy.get("body").type("3");
    cy.get('foreignObject[row="0"][col="1"] > p').should(
      "include.text",
      "3",
    );
  });
});
