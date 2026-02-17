import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.visit("http://localhost:13035");
    cy.openLesson();
    cy.clearBoard();

    // draw fractionLine
    cy.drawLine("divisionlineButton", "divisionLineRightHandle", 170, 260, 255, 260);

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
    cy.selectArea(140, 240, 160, 120);

    // move selection

    cy.dataCy("area-selection").realMouseDown();

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
    }).trigger("mouseup");;


    // verify nominator
    cy.get('foreignObject[row="13"][col="23"] > div > p').should(
      "include.text",
      "3",
    );
    cy.get('foreignObject[row="13"][col="24"] > div > p').should(
      "include.text",
      "1",
    );
    cy.get('foreignObject[row="13"][col="25"] > div > p').should(
      "include.text",
      "+",
    );
    cy.get('foreignObject[row="13"][col="26"] > div > p').should(
      "include.text",
      "1",
    );
    cy.get('foreignObject[row="13"][col="27"] > div > p').should(
      "include.text",
      "1",
    );
    cy.get('foreignObject[row="13"][col="28"] > div > p').should(
      "include.text",
      "x",
    );

    // verify fraction line
    cy.dataCy("division").should("exist");

    // verify denominator
    cy.get('foreignObject[row="14"][col="23"] > div> p').should("include.text", "6");
    cy.get('foreignObject[row="14"][col="24"] > div > p').should("include.text", "1");
    cy.get('foreignObject[row="14"][col="25"] > div > p').should("include.text", "+");
    cy.get('foreignObject[row="14"][col="26"] > div > p').should("include.text", "1");
    cy.get('foreignObject[row="14"][col="27"] > div > p').should("include.text", "1");
    cy.get('foreignObject[row="14"][col="28"] > div > p').should("include.text", "y");

  });
});
