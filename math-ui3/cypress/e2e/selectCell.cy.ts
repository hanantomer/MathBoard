import type {} from "cypress";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");
    // click lessons
    cy.get('[data-cy="lessons"] > .v-btn__content').click();
    cy.login();
    // select lesson
    cy.get('td:contains("test lesson")').click();
    // delete previous added notations
    cy.get("#lessonSvg").trigger("mousedown", 0, 0);
    cy.get("#lessonSvg").trigger("mousemove", 100, 100);
    cy.get("body").type("{del}");

    // select cell
    cy.get('[row="0"] > [col="0"]')
      .click()
      .should("have.css", "stroke")
      .and("include", "rgb(255, 0, 0)"); // selected cell has red stroke
    cy.get('[row="0"] > [col="1"]')
      .should("have.css", "stroke")
      .and("include", "rgb(211, 211, 211)"); // non selected cell has white stroke

    // move right with arrow
    cy.get("body").type("{rightarrow}");
    cy.get('[row="0"] > [col="1"]')
      .should("have.css", "stroke")
      .and("include", "rgb(255, 0, 0)"); // verify new cell is selected
    // move down with arrow
    cy.get("body").type("{downarrow}");
    cy.get('[row="1"] > [col="1"]')
      .should("have.css", "stroke")
      .and("include", "rgb(255, 0, 0)"); // verify new cell is selected

    // type some text
    cy.get("body").type("3");
    cy.get('foreignObject[row="1"][col="1"] > p').should("include.text", "3");
  });
});
