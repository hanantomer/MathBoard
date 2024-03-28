import type {} from "cypress";
import "cypress-real-events";

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
    // cy.get("#lessonSvg").realMouseDown({ x: 100, y: 50 });
    // cy.get("#lessonSvg").realMouseMove(800, 800);
    // cy.get("#lessonSvg").realMouseUp();
    // cy.get("#lessonSvg").realType("{del}");

    // select cell
    // cy.get('[row="0"] > [col="0"]')
    //   .click()
    //   .should("have.css", "stroke")
    //   .and("include", "rgb(255, 0, 0)"); // selected cell has red stroke
    // cy.get('[row="0"] > [col="1"]')
    //   .should("have.css", "stroke")
    //   .and("include", "rgb(211, 211, 211)"); // non selected cell has white stroke

    // // move right with arrow
    // cy.get("body").type("{rightarrow}");
    // cy.get('[row="0"] > [col="1"]')
    //   .should("have.css", "stroke")
    //   .and("include", "rgb(255, 0, 0)"); // verify new cell is selected
    // // move down with arrow
    // cy.get("body").type("{downarrow}");
    // cy.get('[row="1"] > [col="1"]')
    //   .should("have.css", "stroke")
    //   .and("include", "rgb(255, 0, 0)"); // verify new cell is selected

    // type some text
    //    cy.get("body").type("3");
    //    cy.get('foreignObject[row="1"][col="1"] > p').should("include.text", "3");

    //add fraction line
    cy.dataCy("fraction").click();
    cy.get("#lessonSvg")
      .realMouseDown({
        x: 200,
        y: 200,
      });
      //.realMouseMove(500, 200);

    cy.get("#lineRightHandle").realMouseDown();
    //cy.get("#lessonSvg").realMouseMove(500, 300);

    //cy.get("#lineLeftHandle").realMouseUp();
    //.realHover()
    //.wait(500)
    //.get("#lessonSvg")
    //.realMouseMove(800, 300)
    //.wait(500)
    //.realMouseUp()
    //.wait(500);
  });
});
