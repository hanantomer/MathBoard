import type {} from "cypress";

describe("e2e", () => {
  before(function () {});
  it("e2e", () => {
    cy.intercept("POST", "/api/auth").as("login");
    cy.intercept("GET", "/api/lessons*").as("loadLessons");
    cy.intercept("POST", "/api/lessons").as("addLesson");

    const lessonName = `test lesson`;

    cy.login();
    cy.wait("@login");
    cy.location("pathname", { timeout: 15000 }).should("eq", "/lessons");

    cy.wait("@loadLessons");

    cy.dataCy("add-lesson").should("be.visible").click();
    cy.dataCy("new-board-item-dialog")
      .should("be.visible")
      .within(() => {
        cy.dataCy("newItemName").find("input").clear().type(lessonName);
      });

    cy.dataCy("button-save").click();
    cy.wait("@addLesson").its("response.statusCode").should("be.oneOf", [200, 201]);
    cy.dismissUiOverlays();
  });
});
