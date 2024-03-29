import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");
    // click lessons
    cy.get('[data-cy="lessons"] > .v-btn__content').click();
    cy.login();
    // select lesson
    cy.get('td:contains("test lesson")').click();
    cy.dataCy("pBar").should("exist");
    // delete previous added notations
    //cy.get("#lessonSvg").trigger("mousedown", { buttons: 1, x: 100, y: 50 });
    cy.get("#lessonSvg").realMouseDown({ x: 50, y: 50 });
    cy.wait(1000);
    cy.get("#lessonSvg").trigger("mousemove", { buttons: 1, x: 51, y: 51 });
    cy.get("#lessonSvg").trigger("mousemove", { buttons: 1, x: 52, y: 52 });
    cy.get("#lessonSvg").trigger("mousemove", { buttons: 1, x: 1300, y: 700 });
    cy.wait(1000).realMouseUp();
    //      .trigger("mouseup");
    // cy.get("#lessonSvg").realMouseMove(800, 800);
    // cy.get("#lessonSvg").realMouseUp();
    //    cy.wait(1000);
    //cy.get("#lessonSvg").trigger("mouseup");
    cy.get("body").type("{del}");

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
    // cy.dataCy("fraction").click();
    // cy.get("#lessonSvg").realMouseDown({
    //   x: 200,
    //   y: 200,
    // });

    // cy.get("#lessonSvg").trigger("mousemove", { buttons: 1, x: 300, y: 200 });

    // cy.get("#lineRightHandle").realMouseUp();
  });
});
