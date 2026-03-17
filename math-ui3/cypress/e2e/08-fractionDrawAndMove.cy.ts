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

    cy.dataCy("area-selection")
      .trigger("mousedown")
      .trigger("mousemove", {
        buttons: 1,
        x: 250,
        y: 240,
        force: true,
      })
      .trigger("mousemove", {
        buttons: 1,
        x: 251,
        y: 241,
        force: true,
      })
      .trigger("mousemove", {
        buttons: 1,
        x: 252,
        y: 242,
        force: true,
      })
      .trigger("mousemove", {
        buttons: 1,
        x: 400,
        y: 400,
        force: true,
      });

    // small pause to let the UI settle after drag
    cy.get('[row="1"] > [col="1"]').click({ force: true });

    // // verify nominator
    cy.get('foreignObject[row="12"][col="20"] > div > p')
      .should("exist")
      .and("include.text", "3");
    cy.get('foreignObject[row="12"][col="21"] > div > p')
      .should("exist")
      .and("include.text", "1");
    cy.get('foreignObject[row="12"][col="22"] > div > p')
      .should("exist")
      .and("include.text", "+");
    cy.get('foreignObject[row="12"][col="23"] > div > p')
      .should("exist")
      .and("include.text", "1");
    cy.get('foreignObject[row="12"][col="24"] > div > p')
      .should("exist")
      .and("include.text", "1");
    cy.get('foreignObject[row="12"][col="25"] > div > p')
      .should("exist")
      .and("include.text", "x");

    // verify fraction line
    cy.dataCy("division").should("exist");

    // // // verify denominator
     cy.get('foreignObject[row="13"][col="20"] > div> p').should(
       "include.text",
       "6",
     );
    cy.get('foreignObject[row="13"][col="21"] > div > p').should(
      "include.text",
      "1",
    );
    cy.get('foreignObject[row="13"][col="22"] > div > p').should(
      "include.text",
      "+",
    );
    cy.get('foreignObject[row="13"][col="23"] > div > p').should(
      "include.text",
      "1",
    );
    cy.get('foreignObject[row="13"][col="24"] > div > p').should(
      "include.text",
      "1",
    );
    cy.get('foreignObject[row="13"][col="25"] > div > p').should(
      "include.text",
      "y",
    );
  });
});
