import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");
    cy.openLesson();
//    cy.clearBoard();

    // draw fractionLine
    cy.drawLine(300, 300, 200);

    // nominator
    cy.get('[row="8"] > [col="12"]').click();
    cy.get("body").type("3");
    cy.get("body").type("1");
    cy.get("body").type("+");
    cy.get("body").type("1");
    cy.get("body").type("1");
    cy.get("body").type("x");

    // denominator
    cy.get('[row="9"] > [col="12"]').click();
    cy.get("body").type("6");
    cy.get("body").type("1");
    cy.get("body").type("+");
    cy.get("body").type("1");
    cy.get("body").type("1");
    cy.get("body").type("y");

    // select fraction
    cy.selectArea(180, 240, 200, 100);

    // move selection
    cy.get("#selection").realMouseDown();

    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 250,
      y: 240,
      force: true,
    });

    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 251,
      y: 241,
      force: true,
    });

    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 252,
      y: 242,
      force: true,
    });

    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 400,
      y: 400,
      force: true,
    });

    cy.get("#selection").trigger("mouseup");

    // verify nominator
    cy.get('foreignObject[row="13"][col="21"] > p').should("include.text", "3");
    cy.get('foreignObject[row="13"][col="22"] > p').should("include.text", "1");
    cy.get('foreignObject[row="13"][col="23"] > p').should("include.text", "+");
    cy.get('foreignObject[row="13"][col="24"] > p').should("include.text", "1");
    cy.get('foreignObject[row="13"][col="25"] > p').should("include.text", "1");
    cy.get('foreignObject[row="13"][col="26"] > p').should("include.text", "x");

    // verify fraction line
    cy.get(
      'foreignObject[ notationType="FRACTION"][row="14"][fromCol="12"][toCol="18"]',
    ).should("exist");

    // verify denominator
    cy.get('foreignObject[row="14"][col="21"] > p').should("include.text", "6");
    cy.get('foreignObject[row="14"][col="22"] > p').should("include.text", "1");
    cy.get('foreignObject[row="14"][col="23"] > p').should("include.text", "+");
    cy.get('foreignObject[row="14"][col="24"] > p').should("include.text", "1");
    cy.get('foreignObject[row="14"][col="25"] > p').should("include.text", "1");
    cy.get('foreignObject[row="14"][col="26"] > p').should("include.text", "y");
  });
});
