import type {} from "cypress";
import "cypress-real-events";
import "../support/e2e";

describe("e2e", () => {
  before(function () {});
  it("e2e - text draw and type", () => {
    cy.visit("http://localhost:13035");
    cy.openLesson();
    cy.clearBoard();

    // draw text box
    cy.drawLine("textButton", "textRightHandle", 250, 250, 400, 350);

    // verify text box exists
    cy.dataCy("text").should("exist");

    // type text into the textbox
    cy.get("body").type("Sample");
    cy.get("body").type("Text");

    // select the text box to verify content
    cy.selectArea(240, 240, 160, 120);

    // verify text was entered
    cy.dataCy("text").invoke("text").should("include", "Sample");

    // move text selection
    cy.dataCy("area-selection").realMouseDown();

    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 350,
      y: 350,
      force: true,
    });

    cy.get("#lessonSvg").trigger("mousemove", {
      buttons: 1,
      x: 351,
      y: 351,
      force: true,
    });

    cy.get("#lessonSvg")
      .trigger("mousemove", {
        buttons: 1,
        x: 450,
        y: 450,
        force: true,
      })
      .trigger("mouseup");

    // verify text box still exists after move
    cy.dataCy("text").should("exist");
  });
});
