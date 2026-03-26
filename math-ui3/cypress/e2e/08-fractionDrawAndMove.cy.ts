import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");
    // ensure consistent size in headed vs headless
    cy.openLesson();
    cy.clearBoard();

    // draw fractionLine
    cy.drawLine(
      "divisionlineButton",
      "divisionLineRightHandle",
      170,
      260,
      265,
      260,
    );

    // nominator

    cy.get('[row="7"] > [col="11"]').click();
    cy.get("body").type("3");
    cy.get("body").type("1");
    cy.get("body").type("+");
    cy.get("body").type("1");
    cy.get("body").type("1");
    cy.get("body").type("x");

    // denominator
    cy.get('[row="8"] > [col="11"]').click();
    cy.get("body").type("6");
    cy.get("body").type("1");
    cy.get("body").type("+");
    cy.get("body").type("1");
    cy.get("body").type("1");
    cy.get("body").type("y");

    // // select fraction
    cy.selectArea(100, 200, 190, 100);

    cy.wait(500);

    // move selection

    cy.dataCy("area-selection").realMouseDown();

    cy.get("#lessonSvg")
      .realMouseMove(250, 240)
      .realMouseMove(251, 241)
      .realMouseMove(252, 242)
      .realMouseMove(400, 400);

    cy.get("#lessonSvg").realMouseUp();

    cy.wait(500);

    // // verify nominator

    cy.get('foreignObject[row="7"][col="11"] > div > p')
      .should("exist")
      .and("include.text", "3");
    cy.get('foreignObject[row="7"][col="12"] > div > p')
      .should("exist")
      .and("include.text", "1");
    cy.get('foreignObject[row="7"][col="13"] > div > p')
      .should("exist")
      .and("include.text", "+");
    cy.get('foreignObject[row="7"][col="14"] > div > p')
      .should("exist")
      .and("include.text", "1");
    cy.get('foreignObject[row="7"][col="15"] > div > p')
      .should("exist")
      .and("include.text", "1");
    cy.get('foreignObject[row="7"][col="16"] > div > p')
      .should("exist")
      .and("include.text", "x");

    // verify fraction line
    cy.dataCy("division").should("exist");

    // // // verify denominator
     cy.get('foreignObject[row="8"][col="11"] > div> p').should(
       "include.text",
       "6",
     );
    cy.get('foreignObject[row="8"][col="12"] > div > p').should(
      "include.text",
      "1",
    );
    cy.get('foreignObject[row="8"][col="13"] > div > p').should(
      "include.text",
      "+",
    );
    cy.get('foreignObject[row="8"][col="14"] > div > p').should(
      "include.text",
      "1",
    );
    cy.get('foreignObject[row="8"][col="15"] > div > p').should(
      "include.text",
      "1",
    );
    cy.get('foreignObject[row="8"][col="16"] > div > p').should(
      "include.text",
      "y",
    );
  });
});
